# 第7章 测试脚本编程实战

## 7.1 基础练习题

### 练习1：页面标题验证
**题目要求**：使用Selenium打开指定网页，验证页面标题是否正确。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_page_title():
    """练习1：验证页面标题"""
    driver = webdriver.Chrome()
    
    try:
        # 打开百度首页
        driver.get("https://www.baidu.com")
        
        # 获取页面标题
        actual_title = driver.title
        expected_title = "百度一下，你就知道"
        
        # 验证标题
        assert expected_title in actual_title, f"页面标题不正确！预期包含：{expected_title}，实际：{actual_title}"
        print(f"✅ 页面标题验证成功：{actual_title}")
        
    except Exception as e:
        print(f"❌ 测试失败：{e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_page_title()
```

### 练习2：搜索功能测试
**题目要求**：在百度搜索框中输入内容并执行搜索，验证搜索结果。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_search_function():
    """练习2：搜索功能测试"""
    driver = webdriver.Chrome()
    
    try:
        # 打开百度首页
        driver.get("https://www.baidu.com")
        
        # 定位搜索框并输入内容
        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "kw"))
        )
        search_keyword = "Selenium自动化测试"
        search_box.clear()
        search_box.send_keys(search_keyword)
        search_box.send_keys(Keys.RETURN)
        
        # 等待搜索结果页面加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "content_left"))
        )
        
        # 验证搜索结果
        results = driver.find_elements(By.CSS_SELECTOR, ".result.c-container")
        assert len(results) > 0, "没有找到搜索结果"
        print(f"✅ 搜索功能测试成功，找到 {len(results)} 个结果")
        
        # 验证搜索关键词是否出现在页面中
        page_source = driver.page_source
        assert search_keyword in page_source, f"搜索关键词 '{search_keyword}' 未在结果页面中找到"
        print(f"✅ 搜索关键词验证成功")
        
    except Exception as e:
        print(f"❌ 搜索测试失败：{e}")
        driver.save_screenshot("search_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_search_function()
```

### 练习3：表单操作综合练习
**题目要求**：模拟用户注册表单填写，包括文本输入、下拉选择、复选框等操作。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_form_operations():
    """练习3：表单操作综合练习"""
    driver = webdriver.Chrome()
    
    try:
        # 打开测试表单页面
        driver.get("https://www.selenium.dev/selenium/web/web-form.html")
        
        # 等待页面加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "my-text"))
        )
        
        # 1. 文本输入框操作
        text_input = driver.find_element(By.NAME, "my-text")
        text_input.clear()
        text_input.send_keys("测试用户")
        print("✅ 文本输入完成")
        
        # 2. 密码输入框操作
        password_input = driver.find_element(By.NAME, "my-password")
        password_input.clear()
        password_input.send_keys("test123456")
        print("✅ 密码输入完成")
        
        # 3. 文本域操作
        textarea = driver.find_element(By.NAME, "my-textarea")
        textarea.clear()
        textarea.send_keys("这是测试文本域的内容")
        print("✅ 文本域输入完成")
        
        # 4. 下拉框操作
        dropdown = Select(driver.find_element(By.NAME, "my-select"))
        dropdown.select_by_visible_text("Two")
        print("✅ 下拉框选择完成")
        
        # 5. 复选框操作
        checkboxes = driver.find_elements(By.NAME, "my-check")
        for checkbox in checkboxes[:2]:  # 选择前两个复选框
            if not checkbox.is_selected():
                checkbox.click()
        print("✅ 复选框操作完成")
        
        # 6. 单选框操作  
        radio_buttons = driver.find_elements(By.NAME, "my-radio")
        if len(radio_buttons) > 1:
            radio_buttons[1].click()  # 选择第二个单选框
            print("✅ 单选框操作完成")
        
        # 7. 提交表单
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        print("✅ 表单提交完成")
        
        # 验证提交结果
        WebDriverWait(driver, 10).until(
            EC.url_changes(driver.current_url)
        )
        print(f"✅ 表单操作测试完成，当前页面：{driver.current_url}")
        
    except Exception as e:
        print(f"❌ 表单操作测试失败：{e}")
        driver.save_screenshot("form_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_form_operations()
```

## 7.2 登录页面自动化测试（考试重点）

### 基础登录测试用例
**题目背景**：某网站登录页面，用户名输入框id为"user"，密码输入框id为"pwd"，登录按钮id为"login"。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class LoginTest:
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)
    
    def test_valid_login(self):
        """正确用户名密码登录测试"""
        try:
            # 打开登录页面
            self.driver.get("https://example.com/login")
            
            # 输入用户名
            username_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "user"))
            )
            username_field.clear()
            username_field.send_keys("testuser")
            
            # 输入密码
            password_field = self.driver.find_element(By.ID, "pwd")
            password_field.clear()
            password_field.send_keys("testpass")
            
            # 点击登录按钮
            login_button = self.driver.find_element(By.ID, "login")
            login_button.click()
            
            # 验证登录成功
            success_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "welcome"))
            )
            assert "欢迎" in success_element.text
            print("✅ 正确用户名密码登录测试通过")
            
        except Exception as e:
            print(f"❌ 正确用户名密码登录测试失败：{e}")
            self.driver.save_screenshot("valid_login_error.png")
    
    def test_invalid_username(self):
        """错误用户名登录测试"""
        try:
            self.driver.get("https://example.com/login")
            
            # 输入错误用户名
            username_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "user"))
            )
            username_field.clear()
            username_field.send_keys("wronguser")
            
            # 输入正确密码
            password_field = self.driver.find_element(By.ID, "pwd")
            password_field.clear()
            password_field.send_keys("testpass")
            
            # 点击登录按钮
            login_button = self.driver.find_element(By.ID, "login")
            login_button.click()
            
            # 验证错误提示
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            assert "用户名或密码错误" in error_element.text
            print("✅ 错误用户名登录测试通过")
            
        except Exception as e:
            print(f"❌ 错误用户名登录测试失败：{e}")
    
    def test_empty_fields(self):
        """空用户名密码登录测试"""
        try:
            self.driver.get("https://example.com/login")
            
            # 不输入任何内容，直接点击登录
            login_button = self.wait.until(
                EC.element_to_be_clickable((By.ID, "login"))
            )
            login_button.click()
            
            # 验证提示信息
            error_element = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "error"))
            )
            assert "请输入用户名和密码" in error_element.text
            print("✅ 空用户名密码登录测试通过")
            
        except Exception as e:
            print(f"❌ 空用户名密码登录测试失败：{e}")
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()

# 执行测试
if __name__ == "__main__":
    login_test = LoginTest()
    try:
        login_test.test_valid_login()
        login_test.test_invalid_username()
        login_test.test_empty_fields()
    finally:
        login_test.close()
```

## 7.3 结合PO模式的登录测试

### Page Object模式实现
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Page层：页面元素和操作
class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        
        # 页面元素定位器
        self.username_input = (By.ID, "user")
        self.password_input = (By.ID, "pwd")
        self.login_button = (By.ID, "login")
        self.error_message = (By.CLASS_NAME, "error")
        self.welcome_message = (By.CLASS_NAME, "welcome")
    
    def open_login_page(self, url):
        """打开登录页面"""
        self.driver.get(url)
    
    def input_username(self, username):
        """输入用户名"""
        element = self.wait.until(EC.presence_of_element_located(self.username_input))
        element.clear()
        element.send_keys(username)
    
    def input_password(self, password):
        """输入密码"""
        element = self.driver.find_element(*self.password_input)
        element.clear()
        element.send_keys(password)
    
    def click_login_button(self):
        """点击登录按钮"""
        element = self.driver.find_element(*self.login_button)
        element.click()
    
    def get_error_message(self):
        """获取错误提示信息"""
        element = self.wait.until(EC.presence_of_element_located(self.error_message))
        return element.text
    
    def get_welcome_message(self):
        """获取欢迎信息"""
        element = self.wait.until(EC.presence_of_element_located(self.welcome_message))
        return element.text

# Handle层：业务操作逻辑
class LoginHandle:
    def __init__(self, driver):
        self.login_page = LoginPage(driver)
    
    def login(self, url, username, password):
        """执行登录操作"""
        self.login_page.open_login_page(url)
        self.login_page.input_username(username)
        self.login_page.input_password(password)
        self.login_page.click_login_button()
    
    def get_login_result_message(self, is_success_expected=True):
        """获取登录结果信息"""
        if is_success_expected:
            return self.login_page.get_welcome_message()
        else:
            return self.login_page.get_error_message()

# Proxy层：测试用例接口
class LoginProxy:
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.login_handle = LoginHandle(self.driver)
    
    def test_successful_login(self, url, username, password):
        """测试成功登录"""
        self.login_handle.login(url, username, password)
        message = self.login_handle.get_login_result_message(True)
        return "欢迎" in message
    
    def test_failed_login(self, url, username, password):
        """测试登录失败"""
        self.login_handle.login(url, username, password)
        message = self.login_handle.get_login_result_message(False)
        return "错误" in message
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()

# 测试执行
if __name__ == "__main__":
    login_proxy = LoginProxy()
    try:
        # 正确登录测试
        result1 = login_proxy.test_successful_login(
            "https://example.com/login", "testuser", "testpass"
        )
        print(f"正确登录测试：{'通过' if result1 else '失败'}")
        
        # 错误登录测试
        result2 = login_proxy.test_failed_login(
            "https://example.com/login", "wronguser", "wrongpass"
        )
        print(f"错误登录测试：{'通过' if result2 else '失败'}")
        
    finally:
        login_proxy.close()
```

## 7.4 结合unittest框架的完整测试

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

## 7.5 结合日志系统的完整测试实例

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

## 7.6 实战技巧总结

### 编程最佳实践
1. **异常处理**：使用try-except处理可能的异常情况
2. **等待机制**：优先使用显式等待，避免硬编码sleep
3. **截图保存**：测试失败时自动保存截图便于问题分析
4. **日志记录**：关键操作都要记录日志，便于追踪问题
5. **资源清理**：确保在finally块中关闭浏览器

### 常见问题与解决方案
- **元素定位失败**：检查页面是否加载完成，定位器是否正确
- **测试不稳定**：增加等待时间，使用更稳定的定位方式
- **性能问题**：合理设置超时时间，避免无限等待
- **维护困难**：使用PO模式，将页面操作与测试逻辑分离

### 考试重点提醒
1. **登录测试**：掌握正确/错误/空值等多种登录场景
2. **PO模式**：理解三层结构的职责分工和实现方式
3. **unittest框架**：掌握setUp、tearDown等方法的使用
4. **异常处理**：能够正确处理测试过程中的各种异常
5. **日志应用**：在测试中合理使用日志记录关键信息 