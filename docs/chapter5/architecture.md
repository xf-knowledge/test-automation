# PO模式的三层结构

> 本节详细介绍PO模式的三层架构设计，包括页面对象层、操作层和业务层的具体实现。

## 架构概览

```text
┌─────────────────────────────────────┐
│          业务层 (Proxy)             │  ← 测试脚本调用层
│    组合多个页面操作，实现业务流程   │
├─────────────────────────────────────┤
│          操作层 (Handle)            │  ← 页面操作封装层
│       封装页面的具体操作方法        │
├─────────────────────────────────────┤
│          对象库层 (Page)            │  ← 页面元素定义层
│       定义页面元素和基础操作        │
└─────────────────────────────────────┘
```

## 第一层：页面对象层（Page Object Layer）

### 职责
- 定义页面元素的定位器
- 提供页面元素的基础操作方法
- 封装页面的技术细节

### 实现示例
```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    """登录页面对象"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    # 页面元素定位器
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    REMEMBER_ME_CHECKBOX = (By.ID, "remember-me")
    
    # 基础元素操作方法
    def get_username_input(self):
        """获取用户名输入框"""
        return self.wait.until(EC.visibility_of_element_located(self.USERNAME_INPUT))
    
    def get_password_input(self):
        """获取密码输入框"""
        return self.wait.until(EC.visibility_of_element_located(self.PASSWORD_INPUT))
    
    def get_login_button(self):
        """获取登录按钮"""
        return self.wait.until(EC.element_to_be_clickable(self.LOGIN_BUTTON))
    
    def get_error_message(self):
        """获取错误信息"""
        return self.wait.until(EC.visibility_of_element_located(self.ERROR_MESSAGE))
    
    def is_error_displayed(self):
        """检查错误信息是否显示"""
        try:
            self.get_error_message()
            return True
        except:
            return False
```

## 第二层：操作层（Handle Layer）

### 职责
- 基于页面对象层，封装具体的页面操作
- 实现页面的交互逻辑
- 提供有意义的业务方法名

### 实现示例
```python
class LoginHandle:
    """登录页面操作处理类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.login_page = LoginPage(driver)
    
    def navigate_to_login_page(self):
        """导航到登录页面"""
        self.driver.get("https://example.com/login")
        return self
    
    def input_username(self, username):
        """输入用户名"""
        username_input = self.login_page.get_username_input()
        username_input.clear()
        username_input.send_keys(username)
        return self
    
    def input_password(self, password):
        """输入密码"""
        password_input = self.login_page.get_password_input()
        password_input.clear()
        password_input.send_keys(password)
        return self
    
    def click_login_button(self):
        """点击登录按钮"""
        login_button = self.login_page.get_login_button()
        login_button.click()
        return self
    
    def check_remember_me(self):
        """勾选记住我"""
        checkbox = self.driver.find_element(*self.login_page.REMEMBER_ME_CHECKBOX)
        if not checkbox.is_selected():
            checkbox.click()
        return self
    
    def get_error_message_text(self):
        """获取错误信息文本"""
        error_element = self.login_page.get_error_message()
        return error_element.text
    
    def wait_for_login_success(self):
        """等待登录成功"""
        WebDriverWait(self.driver, 10).until(
            EC.url_contains("dashboard")
        )
        return self
    
    def wait_for_login_failure(self):
        """等待登录失败"""
        return self.login_page.is_error_displayed()
```

## 第三层：业务层（Proxy Layer）

### 职责
- 组合多个页面操作，实现完整的业务流程
- 提供高级业务接口
- 封装复杂的业务逻辑

### 实现示例
```python
class LoginProxy:
    """登录业务代理类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.login_handle = LoginHandle(driver)
    
    def login_with_valid_credentials(self, username="testuser", password="testpass"):
        """使用有效凭据登录"""
        try:
            self.login_handle.navigate_to_login_page()
            self.login_handle.input_username(username)
            self.login_handle.input_password(password)
            self.login_handle.click_login_button()
            self.login_handle.wait_for_login_success()
            return True, "登录成功"
        except Exception as e:
            return False, f"登录失败: {str(e)}"
    
    def login_with_invalid_credentials(self, username="wronguser", password="wrongpass"):
        """使用无效凭据登录"""
        try:
            self.login_handle.navigate_to_login_page()
            self.login_handle.input_username(username)
            self.login_handle.input_password(password)
            self.login_handle.click_login_button()
            
            if self.login_handle.wait_for_login_failure():
                error_message = self.login_handle.get_error_message_text()
                return True, f"登录失败，错误信息: {error_message}"
            else:
                return False, "预期登录失败，但实际成功了"
        except Exception as e:
            return False, f"测试过程中发生错误: {str(e)}"
    
    def login_with_remember_me(self, username="testuser", password="testpass"):
        """登录并勾选记住我"""
        try:
            self.login_handle.navigate_to_login_page()
            self.login_handle.input_username(username)
            self.login_handle.input_password(password)
            self.login_handle.check_remember_me()
            self.login_handle.click_login_button()
            self.login_handle.wait_for_login_success()
            return True, "登录成功（已勾选记住我）"
        except Exception as e:
            return False, f"登录失败: {str(e)}"
    
    def quick_login(self, user_type="admin"):
        """快速登录（预设用户）"""
        user_credentials = {
            "admin": ("admin", "admin123"),
            "user": ("testuser", "testpass"),
            "guest": ("guest", "guest123")
        }
        
        if user_type not in user_credentials:
            return False, f"未知用户类型: {user_type}"
        
        username, password = user_credentials[user_type]
        return self.login_with_valid_credentials(username, password)
```

## 层次关系与数据流

### 调用关系
```python
# 测试代码 → 业务层 → 操作层 → 页面对象层 → WebDriver

# 实际调用链路示例：
# test_login() → login_proxy.login_with_valid_credentials() 
# → login_handle.input_username() → login_page.get_username_input() 
# → driver.find_element()
```

### 数据流向
```
测试数据 → Proxy层（业务逻辑） → Handle层（操作封装） → Page层（元素交互） → 浏览器
```

### 职责边界
- **Page层**：只关心"在哪里"（元素定位）和"是什么"（元素获取）
- **Handle层**：关心"怎么做"（具体操作）和"做什么"（操作组合）
- **Proxy层**：关心"为什么做"（业务目的）和"业务流程"（端到端场景）

## 设计原则

### 1. 单向依赖
```python
# 正确：上层依赖下层
class LoginProxy:
    def __init__(self, driver):
        self.login_handle = LoginHandle(driver)  # ✅

# 错误：下层不应该依赖上层
class LoginPage:
    def __init__(self, driver, proxy):  # ❌ 不应该依赖Proxy
        pass
```

### 2. 接口稳定性
```python
# Handle层提供稳定的接口
class LoginHandle:
    def input_credentials(self, username, password):
        """接口保持稳定，内部实现可以变化"""
        # 实现可能会变化，但接口保持不变
        pass
```

### 3. 职责分离
```python
# 每层专注于自己的职责
class LoginPage:
    """只关心元素定位和基础操作"""
    pass

class LoginHandle:
    """只关心页面操作的封装"""
    pass

class LoginProxy:
    """只关心业务流程的实现"""
    pass
``` 