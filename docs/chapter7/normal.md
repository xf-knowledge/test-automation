# 结合日志系统的完整测试实例

```python
import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
import os

# 配置日志系统
def setup_logging():
    """配置测试日志"""
    log_dir = 'test_logs'
    os.makedirs(log_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = f'{log_dir}/login_test_{timestamp}.log'
    
    logger = logging.getLogger('login_test')
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()
    
    # 文件处理器
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    
    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # 格式器
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(funcName)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

class LoginTestWithLogging(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """测试类初始化"""
        cls.logger = setup_logging()
        cls.logger.info("="*60)
        cls.logger.info("开始执行登录功能测试套件")
        
        cls.driver = webdriver.Chrome()
        cls.wait = WebDriverWait(cls.driver, 10)
        cls.base_url = "https://example.com/login"
        cls.logger.info(f"测试环境初始化完成，目标URL: {cls.base_url}")
    
    def setUp(self):
        """测试用例初始化"""
        self.logger.info(f"开始执行测试用例: {self._testMethodName}")
        self.logger.debug("导航到登录页面")
        self.driver.get(self.base_url)
    
    def tearDown(self):
        """测试用例清理"""
        if hasattr(self, '_outcome'):
            # 检查测试结果
            if self._outcome.errors or self._outcome.failures:
                self.logger.error(f"测试用例 {self._testMethodName} 执行失败")
                # 保存错误截图
                screenshot_name = f"error_{self._testMethodName}_{datetime.now().strftime('%H%M%S')}.png"
                self.driver.save_screenshot(f"test_logs/{screenshot_name}")
                self.logger.error(f"错误截图已保存: {screenshot_name}")
            else:
                self.logger.info(f"测试用例 {self._testMethodName} 执行成功")
    
    @classmethod
    def tearDownClass(cls):
        """测试类清理"""
        cls.logger.info("关闭浏览器，清理测试环境")
        cls.driver.quit()
        cls.logger.info("登录功能测试套件执行完成")
        cls.logger.info("="*60)
    
    def login_with_logging(self, username, password, description=""):
        """带日志记录的登录操作"""
        self.logger.info(f"执行登录操作: {description}")
        self.logger.debug(f"用户名: {username}, 密码: {'*' * len(password)}")
        
        try:
            # 输入用户名
            self.logger.debug("定位并输入用户名")
            username_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "user"))
            )
            username_field.clear()
            username_field.send_keys(username)
            
            # 输入密码
            self.logger.debug("定位并输入密码")
            password_field = self.driver.find_element(By.ID, "pwd")
            password_field.clear()
            password_field.send_keys(password)
            
            # 点击登录按钮
            self.logger.debug("点击登录按钮")
            login_button = self.driver.find_element(By.ID, "login")
            login_button.click()
            
            self.logger.info("登录操作执行完成")
            
        except Exception as e:
            self.logger.error(f"登录操作执行失败: {e}")
            raise
    
    def test_successful_login(self):
        """测试成功登录"""
        self.login_with_logging("testuser", "testpass", "正确用户名密码登录")
        
        try:
            welcome_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "welcome"))
            )
            self.assertIn("欢迎", welcome_element.text)
            self.logger.info("登录成功验证通过")
            
        except Exception as e:
            self.logger.error(f"登录成功验证失败: {e}")
            raise
    
    def test_invalid_credentials(self):
        """测试无效凭据登录"""
        self.login_with_logging("wronguser", "wrongpass", "错误用户名密码登录")
        
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            self.assertIn("用户名或密码错误", error_element.text)
            self.logger.info("错误登录验证通过")
            
        except Exception as e:
            self.logger.error(f"错误登录验证失败: {e}")
            raise

if __name__ == "__main__":
    # 执行测试
    unittest.main(verbosity=2)
```