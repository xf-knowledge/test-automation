# 结合PO模式的登录测试

## Page Object模式实现

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