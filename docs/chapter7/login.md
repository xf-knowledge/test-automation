# 登录页面自动化测试综合案例

> **期末考试高频题型**：登录页面自动化测试是编程题的经典考点，必须掌握完整的测试流程、异常处理和页面截图技术。

## 考试题型分析

### 典型题目要求
1. **基础要求**：实现用户登录功能的自动化测试
2. **元素定位**：正确定位用户名输入框(id="user")、密码输入框(id="pwd")、登录按钮(id="login")
3. **测试场景**：正确登录、错误凭据、空字段等多种场景
4. **异常处理**：捕获并处理各种异常情况
5. **结果验证**：验证登录成功或失败的提示信息
6. **页面截图**：失败时自动保存错误截图

## 标准解题模板

### 基础登录测试类
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import time
from datetime import datetime

class LoginAutomationTest:
    """登录页面自动化测试标准实现"""
    
    def __init__(self, base_url="https://example.com/login"):
        """初始化测试环境"""
        self.base_url = base_url
        self.driver = None
        self.wait = None
        self._setup_logging()
        self._init_driver()
    
    def _setup_logging(self):
        """配置日志系统"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(f'login_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8')
            ]
        )
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def _init_driver(self):
        """初始化WebDriver"""
        try:
            self.driver = webdriver.Chrome()
            self.wait = WebDriverWait(self.driver, 10)
            self.logger.info("WebDriver初始化成功")
        except Exception as e:
            self.logger.critical(f"WebDriver初始化失败：{e}")
            raise
    
    def open_login_page(self):
        """打开登录页面"""
        try:
            self.logger.info(f"导航到登录页面：{self.base_url}")
            self.driver.get(self.base_url)
            
            # 验证页面加载
            self.wait.until(EC.presence_of_element_located((By.ID, "user")))
            self.logger.info("登录页面加载成功")
            
        except Exception as e:
            self.logger.error(f"登录页面加载失败：{e}")
            self._save_screenshot("page_load_error")
            raise
    
    def perform_login(self, username, password):
        """执行登录操作"""
        try:
            self.logger.info(f"开始登录操作，用户名：{username}")
            
            # 1. 定位并输入用户名
            username_field = self.wait.until(
                EC.element_to_be_clickable((By.ID, "user"))
            )
            username_field.clear()
            username_field.send_keys(username)
            self.logger.debug("用户名输入完成")
            
            # 2. 定位并输入密码
            password_field = self.driver.find_element(By.ID, "pwd")
            password_field.clear()
            password_field.send_keys(password)
            self.logger.debug("密码输入完成")
            
            # 3. 点击登录按钮
            login_button = self.driver.find_element(By.ID, "login")
            login_button.click()
            self.logger.info("登录按钮点击完成")
            
            # 4. 等待页面响应
            time.sleep(2)
            
        except Exception as e:
            self.logger.error(f"登录操作执行失败：{e}")
            self._save_screenshot("login_operation_error")
            raise
    
    def verify_login_success(self):
        """验证登录成功"""
        try:
            # 方法1：检查成功元素
            success_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "welcome"))
            )
            success_message = success_element.text
            
            if "欢迎" in success_message:
                self.logger.info("登录成功验证通过")
                return True
            else:
                self.logger.warning(f"成功页面文本异常：{success_message}")
                return False
                
        except Exception:
            # 方法2：检查URL变化
            current_url = self.driver.current_url
            if "dashboard" in current_url or "home" in current_url:
                self.logger.info("通过URL变化验证登录成功")
                return True
            
            self.logger.error("登录成功验证失败")
            return False
    
    def verify_login_failure(self, expected_error_text="用户名或密码错误"):
        """验证登录失败"""
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            error_message = error_element.text
            
            if expected_error_text in error_message:
                self.logger.info(f"登录失败验证通过：{error_message}")
                return True
            else:
                self.logger.warning(f"错误信息不符合预期：{error_message}")
                return False
                
        except Exception as e:
            self.logger.error(f"登录失败验证异常：{e}")
            self._save_screenshot("login_failure_verify_error")
            return False
    
    def _save_screenshot(self, scenario):
        """保存错误截图"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"screenshot_{scenario}_{timestamp}.png"
            self.driver.save_screenshot(screenshot_path)
            self.logger.info(f"截图已保存：{screenshot_path}")
        except Exception as e:
            self.logger.error(f"截图保存失败：{e}")
    
    def cleanup(self):
        """清理资源"""
        if self.driver:
            self.driver.quit()
            self.logger.info("WebDriver已关闭")

# 使用示例
def main():
    """主测试函数"""
    test = LoginAutomationTest()
    
    try:
        # 测试场景1：正确登录
        test.open_login_page()
        test.perform_login("testuser", "testpass")
        if test.verify_login_success():
            print("✅ 正确登录测试通过")
        else:
            print("❌ 正确登录测试失败")
            
    except Exception as e:
        print(f"❌ 测试执行异常：{e}")
    finally:
        test.cleanup()

if __name__ == "__main__":
    main()
```

## 多场景测试实现

### 完整测试套件
```python
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
from datetime import datetime

class LoginTestSuite(unittest.TestCase):
    """登录功能完整测试套件"""
    
    @classmethod
    def setUpClass(cls):
        """测试类初始化"""
        cls._setup_logging()
        cls.base_url = "https://example.com/login"
        cls.driver = webdriver.Chrome()
        cls.wait = WebDriverWait(cls.driver, 10)
        cls.logger.info("="*60)
        cls.logger.info("开始执行登录功能测试套件")
    
    @classmethod
    def _setup_logging(cls):
        """配置日志"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(f'login_suite_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8')
            ]
        )
        cls.logger = logging.getLogger(cls.__name__)
    
    def setUp(self):
        """每个测试用例前的准备"""
        self.logger.info(f"开始执行测试用例：{self._testMethodName}")
        self.driver.get(self.base_url)
        
        # 等待页面加载
        try:
            self.wait.until(EC.presence_of_element_located((By.ID, "user")))
        except Exception as e:
            self.logger.error(f"页面加载失败：{e}")
            self._save_screenshot("page_load_failed")
            raise
    
    def tearDown(self):
        """每个测试用例后的清理"""
        if hasattr(self, '_outcome'):
            if self._outcome.errors or self._outcome.failures:
                self.logger.error(f"测试用例失败：{self._testMethodName}")
                self._save_screenshot(f"test_failed_{self._testMethodName}")
            else:
                self.logger.info(f"测试用例通过：{self._testMethodName}")
    
    @classmethod
    def tearDownClass(cls):
        """测试类清理"""
        cls.driver.quit()
        cls.logger.info("登录功能测试套件执行完成")
        cls.logger.info("="*60)
    
    def _perform_login(self, username, password):
        """登录操作的公共方法"""
        try:
            # 输入用户名
            username_field = self.wait.until(
                EC.element_to_be_clickable((By.ID, "user"))
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
            
            self.logger.debug(f"登录操作完成 - 用户名：{username}")
            
        except Exception as e:
            self.logger.error(f"登录操作失败：{e}")
            raise
    
    def _save_screenshot(self, scenario):
        """保存截图"""
        try:
            timestamp = datetime.now().strftime("%H%M%S")
            screenshot_path = f"screenshot_{scenario}_{timestamp}.png"
            self.driver.save_screenshot(screenshot_path)
            self.logger.info(f"截图已保存：{screenshot_path}")
        except Exception as e:
            self.logger.error(f"截图保存失败：{e}")
    
    def test_01_valid_login(self):
        """测试用例1：有效用户名和密码登录"""
        self._perform_login("testuser", "testpass")
        
        # 验证登录成功
        try:
            success_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "welcome"))
            )
            self.assertIn("欢迎", success_element.text, "登录成功页面验证失败")
            self.logger.info("有效登录测试通过")
            
        except Exception as e:
            self.logger.error(f"登录成功验证失败：{e}")
            self.fail("登录成功验证失败")
    
    def test_02_invalid_username(self):
        """测试用例2：无效用户名登录"""
        self._perform_login("invaliduser", "testpass")
        
        # 验证错误提示
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            self.assertIn("用户名或密码错误", error_element.text, "错误提示信息验证失败")
            self.logger.info("无效用户名测试通过")
            
        except Exception as e:
            self.logger.error(f"错误提示验证失败：{e}")
            self.fail("错误提示验证失败")
    
    def test_03_invalid_password(self):
        """测试用例3：无效密码登录"""
        self._perform_login("testuser", "wrongpass")
        
        # 验证错误提示
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            self.assertIn("用户名或密码错误", error_element.text, "错误提示信息验证失败")
            self.logger.info("无效密码测试通过")
            
        except Exception as e:
            self.logger.error(f"错误提示验证失败：{e}")
            self.fail("错误提示验证失败")
    
    def test_04_empty_username(self):
        """测试用例4：空用户名登录"""
        self._perform_login("", "testpass")
        
        # 验证提示信息
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            error_text = error_element.text
            self.assertTrue(
                "请输入用户名" in error_text or "用户名不能为空" in error_text,
                f"空用户名提示信息不正确：{error_text}"
            )
            self.logger.info("空用户名测试通过")
            
        except Exception as e:
            self.logger.error(f"空用户名验证失败：{e}")
            self.fail("空用户名验证失败")
    
    def test_05_empty_password(self):
        """测试用例5：空密码登录"""
        self._perform_login("testuser", "")
        
        # 验证提示信息
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            error_text = error_element.text
            self.assertTrue(
                "请输入密码" in error_text or "密码不能为空" in error_text,
                f"空密码提示信息不正确：{error_text}"
            )
            self.logger.info("空密码测试通过")
            
        except Exception as e:
            self.logger.error(f"空密码验证失败：{e}")
            self.fail("空密码验证失败")
    
    def test_06_empty_both_fields(self):
        """测试用例6：用户名和密码都为空"""
        self._perform_login("", "")
        
        # 验证提示信息
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            error_text = error_element.text
            self.assertTrue(
                "请输入用户名和密码" in error_text or "用户名和密码不能为空" in error_text,
                f"空字段提示信息不正确：{error_text}"
            )
            self.logger.info("空字段测试通过")
            
        except Exception as e:
            self.logger.error(f"空字段验证失败：{e}")
            self.fail("空字段验证失败")

# 执行测试套件
if __name__ == "__main__":
    # 创建测试套件
    suite = unittest.TestLoader().loadTestsFromTestCase(LoginTestSuite)
    
    # 执行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # 输出测试结果摘要
    print("\n" + "="*60)
    print("测试结果摘要")
    print("="*60)
    print(f"执行测试用例数：{result.testsRun}")
    print(f"成功：{result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"失败：{len(result.failures)}")
    print(f"错误：{len(result.errors)}")
    print("="*60)
```

## 高级特性实现

### 带有浏览器导航验证的登录测试
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import time

class AdvancedLoginTest:
    """高级登录测试 - 包含浏览器导航和状态验证"""
    
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
        self.logger = logging.getLogger(self.__class__.__name__)
        logging.basicConfig(level=logging.INFO)
    
    def test_login_with_navigation_verification(self):
        """登录测试 - 包含完整的导航和状态验证"""
        try:
            self.logger.info("开始执行高级登录测试")
            
            # 1. 记录初始状态
            initial_url = None
            self.logger.info("记录浏览器初始状态")
            
            # 2. 导航到登录页面
            login_url = "https://example.com/login"
            self.logger.info(f"导航到登录页面：{login_url}")
            self.driver.get(login_url)
            
            # 验证页面标题
            expected_title = "用户登录"
            actual_title = self.driver.title
            assert expected_title in actual_title, f"页面标题验证失败，期望包含：{expected_title}，实际：{actual_title}"
            self.logger.info(f"页面标题验证通过：{actual_title}")
            
            # 3. 验证页面元素存在
            self._verify_login_page_elements()
            
            # 4. 执行登录操作
            self._perform_login_operation("testuser", "testpass")
            
            # 5. 验证登录后的页面状态
            self._verify_post_login_state()
            
            # 6. 验证浏览器导航功能
            self._verify_browser_navigation()
            
            self.logger.info("高级登录测试执行成功")
            
        except Exception as e:
            self.logger.error(f"高级登录测试失败：{e}")
            self._save_error_screenshot("advanced_login_test_failed")
            raise
        finally:
            self.driver.quit()
    
    def _verify_login_page_elements(self):
        """验证登录页面元素"""
        self.logger.info("验证登录页面元素")
        
        elements_to_check = [
            ("user", "用户名输入框"),
            ("pwd", "密码输入框"),
            ("login", "登录按钮")
        ]
        
        for element_id, description in elements_to_check:
            try:
                element = self.wait.until(
                    EC.presence_of_element_located((By.ID, element_id))
                )
                assert element.is_displayed(), f"{description}不可见"
                self.logger.debug(f"{description}验证通过")
            except Exception as e:
                self.logger.error(f"{description}验证失败：{e}")
                raise
    
    def _perform_login_operation(self, username, password):
        """执行登录操作"""
        self.logger.info(f"执行登录操作 - 用户名：{username}")
        
        # 记录登录前的URL
        pre_login_url = self.driver.current_url
        self.logger.debug(f"登录前URL：{pre_login_url}")
        
        # 输入凭据
        username_field = self.driver.find_element(By.ID, "user")
        password_field = self.driver.find_element(By.ID, "pwd")
        login_button = self.driver.find_element(By.ID, "login")
        
        username_field.clear()
        username_field.send_keys(username)
        self.logger.debug("用户名输入完成")
        
        password_field.clear()
        password_field.send_keys(password)
        self.logger.debug("密码输入完成")
        
        # 点击登录按钮前记录时间
        start_time = time.time()
        login_button.click()
        self.logger.debug("登录按钮已点击")
        
        # 等待页面响应
        self.wait.until(EC.url_changes(pre_login_url))
        end_time = time.time()
        
        response_time = end_time - start_time
        self.logger.info(f"登录响应时间：{response_time:.2f}秒")
        
        if response_time > 3:
            self.logger.warning("登录响应时间较长")
    
    def _verify_post_login_state(self):
        """验证登录后的状态"""
        self.logger.info("验证登录后状态")
        
        # 验证URL变化
        current_url = self.driver.current_url
        self.logger.debug(f"登录后URL：{current_url}")
        
        expected_urls = ["dashboard", "home", "main", "index"]
        url_valid = any(expected in current_url for expected in expected_urls)
        assert url_valid, f"登录后URL异常：{current_url}"
        
        # 验证页面标题变化
        new_title = self.driver.title
        self.logger.debug(f"登录后页面标题：{new_title}")
        
        # 验证成功提示或欢迎信息
        try:
            welcome_elements = self.driver.find_elements(By.CLASS_NAME, "welcome")
            if welcome_elements:
                welcome_text = welcome_elements[0].text
                self.logger.info(f"欢迎信息：{welcome_text}")
                assert "欢迎" in welcome_text or "Welcome" in welcome_text
        except Exception:
            # 如果没有欢迎信息，验证用户信息显示
            user_info = self.driver.find_elements(By.CLASS_NAME, "user-info")
            assert len(user_info) > 0, "登录后未找到用户信息显示"
        
        self.logger.info("登录后状态验证通过")
    
    def _verify_browser_navigation(self):
        """验证浏览器导航功能"""
        self.logger.info("验证浏览器导航功能")
        
        # 记录当前页面
        current_url = self.driver.current_url
        current_title = self.driver.title
        
        # 测试后退功能
        self.logger.debug("测试浏览器后退功能")
        self.driver.back()
        time.sleep(1)
        
        back_url = self.driver.current_url
        self.logger.debug(f"后退后URL：{back_url}")
        
        # 测试前进功能
        self.logger.debug("测试浏览器前进功能")
        self.driver.forward()
        time.sleep(1)
        
        forward_url = self.driver.current_url
        forward_title = self.driver.title
        
        # 验证前进后回到原页面
        assert forward_url == current_url, f"前进功能异常，期望：{current_url}，实际：{forward_url}"
        assert forward_title == current_title, f"前进后标题异常，期望：{current_title}，实际：{forward_title}"
        
        # 测试刷新功能
        self.logger.debug("测试页面刷新功能")
        self.driver.refresh()
        time.sleep(2)
        
        refresh_url = self.driver.current_url
        assert refresh_url == current_url, f"刷新后URL异常，期望：{current_url}，实际：{refresh_url}"
        
        self.logger.info("浏览器导航功能验证通过")
    
    def _save_error_screenshot(self, scenario):
        """保存错误截图"""
        try:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"error_{scenario}_{timestamp}.png"
            self.driver.save_screenshot(screenshot_path)
            self.logger.error(f"错误截图已保存：{screenshot_path}")
        except Exception as e:
            self.logger.error(f"截图保存失败：{e}")

# 执行高级测试
if __name__ == "__main__":
    test = AdvancedLoginTest()
    test.test_login_with_navigation_verification()
```

## 考试答题要点

### 关键技术点总结
1. **WebDriver初始化**：正确配置Chrome驱动
2. **元素定位**：使用准确的定位策略(ID优先)
3. **显式等待**：使用WebDriverWait确保元素可用
4. **异常处理**：全面的try-catch异常捕获
5. **日志记录**：完整的操作日志和错误记录
6. **截图功能**：失败时自动保存页面截图
7. **结果验证**：多种验证方法确保测试准确性
8. **资源清理**：确保WebDriver正确关闭

### 常见考试陷阱
1. **忘记等待页面加载**：直接操作元素导致失败
2. **异常处理不完善**：没有捕获所有可能的异常
3. **验证逻辑不全面**：只验证成功情况，忽略失败场景
4. **资源泄露**：没有正确关闭WebDriver
5. **日志信息不足**：缺少关键操作的日志记录

通过掌握这个综合案例，您可以应对各种登录页面自动化测试的编程题要求。