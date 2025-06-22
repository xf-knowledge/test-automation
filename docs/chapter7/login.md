# 登录页面自动化测试

> （考试重点）

## 基础登录测试用例

> **题目背景**：某网站登录页面，用户名输入框id为"user"，密码输入框id为"pwd"，登录按钮id为"login"。

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