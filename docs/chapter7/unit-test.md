# 结合unittest框架的完整测试

```python
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class LoginTestSuite(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """测试类级别的初始化"""
        cls.driver = webdriver.Chrome()
        cls.wait = WebDriverWait(cls.driver, 10)
        cls.base_url = "https://example.com/login"
    
    def setUp(self):
        """每个测试用例执行前的初始化"""
        self.driver.get(self.base_url)
        print(f"\n开始执行测试用例：{self._testMethodName}")
    
    def tearDown(self):
        """每个测试用例执行后的清理"""
        print(f"测试用例 {self._testMethodName} 执行完成")
        time.sleep(1)  # 测试间隔
    
    @classmethod
    def tearDownClass(cls):
        """测试类级别的清理"""
        cls.driver.quit()
        print("\n所有测试用例执行完成，浏览器已关闭")
    
    def login_action(self, username, password):
        """登录操作的公共方法"""
        # 输入用户名
        username_field = self.wait.until(
            EC.presence_of_element_located((By.ID, "user"))
        )
        username_field.clear()
        username_field.send_keys(username)
        
        # 输入密码
        password_field = self.driver.find_element(By.ID, "pwd")
        password_field.clear()
        password_field.send_keys(password)
        
        # 点击登录按钮
        login_button = self.driver.find_element(By.ID, "login")
        login_button.click()
    
    def test_01_valid_login(self):
        """测试有效登录"""
        self.login_action("testuser", "testpass")
        
        # 验证登录成功
        welcome_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "welcome"))
        )
        self.assertIn("欢迎", welcome_element.text, "登录成功页面未正确显示")
    
    def test_02_invalid_username(self):
        """测试无效用户名"""
        self.login_action("invaliduser", "testpass")
        
        # 验证错误提示
        error_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error"))
        )
        self.assertIn("用户名或密码错误", error_element.text, "错误提示信息不正确")
    
    def test_03_invalid_password(self):
        """测试无效密码"""
        self.login_action("testuser", "wrongpass")
        
        # 验证错误提示
        error_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error"))
        )
        self.assertIn("用户名或密码错误", error_element.text, "错误提示信息不正确")
    
    def test_04_empty_username(self):
        """测试空用户名"""
        self.login_action("", "testpass")
        
        # 验证提示信息
        error_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error"))
        )
        self.assertIn("请输入用户名", error_element.text, "空用户名提示不正确")
    
    def test_05_empty_password(self):
        """测试空密码"""
        self.login_action("testuser", "")
        
        # 验证提示信息
        error_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error"))
        )
        self.assertIn("请输入密码", error_element.text, "空密码提示不正确")
    
    def test_06_empty_both(self):
        """测试用户名密码都为空"""
        self.login_action("", "")
        
        # 验证提示信息
        error_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "error"))
        )
        self.assertIn("请输入用户名和密码", error_element.text, "空字段提示不正确")

if __name__ == "__main__":
    # 创建测试套件
    suite = unittest.TestLoader().loadTestsFromTestCase(LoginTestSuite)
    
    # 执行测试
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
```