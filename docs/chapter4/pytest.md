# pytest框架详解

> pytest是一个功能强大的第三方测试框架，以简洁的语法和丰富的插件生态系统著称，已成为Python自动化测试的首选框架。

## pytest框架简介

pytest是一个功能强大的第三方测试框架，以简洁的语法和丰富的插件生态系统著称。它代表了更现代的测试框架设计理念，通过简洁的语法、强大的Fixture系统和丰富的插件生态，极大地提升了开发效率和测试代码的可维护性。在当前业界，pytest已经成为Python自动化测试的首选框架。

```bash
# 安装pytest
pip install pytest
```

## pytest核心特点

### 1. 简洁语法

pytest不需要继承特定的类，测试函数以`test_`开头即可：

```python
# test_simple.py
def test_addition():
    """简单的加法测试"""
    assert 1 + 1 == 2

def test_string_contains():
    """字符串包含测试"""
    text = "Hello World"
    assert "Hello" in text

def test_list_length():
    """列表长度测试"""
    my_list = [1, 2, 3, 4, 5]
    assert len(my_list) == 5
```

### 2. 强大的断言

pytest使用Python的原生`assert`语句，更加直观：

```python
def test_assertions():
    """pytest断言示例"""
    
    # 相等断言
    assert 2 + 2 == 4
    assert "hello" == "hello"
    
    # 布尔断言
    assert True
    assert not False
    
    # 包含断言
    assert "Python" in "Python测试"
    assert 5 in [1, 2, 3, 4, 5]
    
    # 比较断言
    assert 10 > 5
    assert 3.14 < 4
    
    # 类型断言
    assert isinstance("test", str)
    assert isinstance([1, 2, 3], list)
    
    # 异常断言
    import pytest
    with pytest.raises(ValueError):
        int("not_a_number")
```

### 3. 丰富的插件支持

pytest拥有强大的插件生态系统，满足各种测试需求。

## pytest核心插件

### 1. pytest-ordering（控制执行顺序）

```bash
# 安装插件
pip install pytest-ordering
```

```python
import pytest

class TestOrder:
    
    @pytest.mark.run(order=1)
    def test_first(self):
        """第一个执行的测试"""
        print("这是第一个测试")
        assert True
    
    @pytest.mark.run(order=3)
    def test_third(self):
        """第三个执行的测试"""
        print("这是第三个测试")
        assert True
    
    @pytest.mark.run(order=2)
    def test_second(self):
        """第二个执行的测试"""
        print("这是第二个测试")
        assert True
```

### 2. 跳过测试

在管理大型测试套件时，能够跳过某些测试非常有用：

```python
import pytest

@pytest.mark.skip(reason="功能尚未实现")
def test_future_feature():
    """这个测试会被跳过"""
    pass

@pytest.mark.skipif(condition=True, reason="条件不满足")
def test_conditional_skip():
    """根据条件跳过测试"""
    pass

# 根据操作系统版本或环境配置来决定是否执行某个测试
import sys

@pytest.mark.skipif(sys.version_info < (3, 8), reason="需要 Python 3.8+")
def test_python38_feature():
    """只在 Python 3.8+ 上运行"""
    assert True
```

### 3. pytest-rerunfailures（失败重试）

```bash
# 安装插件
pip install pytest-rerunfailures
```

```python
import pytest
import random

class TestRetry:
    
    @pytest.mark.flaky(reruns=3, reruns_delay=1)
    def test_unstable_feature(self):
        """不稳定的测试，失败时重试3次"""
        # 模拟不稳定的测试
        success_rate = 0.7
        if random.random() < success_rate:
            assert True
        else:
            assert False, "随机失败"
```

```bash
# 运行时指定重试次数
pytest --reruns 2 --reruns-delay 1 test_file.py
```

### 4. pytest-html（生成报告）

```bash
# 安装插件
pip install pytest-html
```

```python
# test_report.py
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

class TestReport:
    
    def setup_method(self):
        """每个测试方法前执行"""
        self.driver = webdriver.Chrome()
    
    def teardown_method(self):
        """每个测试方法后执行"""
        self.driver.quit()
    
    def test_page_load(self):
        """测试页面加载"""
        self.driver.get("https://www.baidu.com")
        assert "百度" in self.driver.title
    
    def test_search_function(self):
        """测试搜索功能"""
        self.driver.get("https://www.baidu.com")
        search_box = self.driver.find_element(By.ID, "kw")
        search_box.send_keys("pytest")
        search_box.submit()
        
        # 等待结果页面加载
        assert "pytest" in self.driver.title
```

```bash
# 生成HTML报告
pytest --html=report.html --self-contained-html test_report.py
```

## pytest高级功能

### 1. 参数化测试

```python
import pytest

@pytest.mark.parametrize("username,password,expected", [
    ("admin", "admin123", "success"),
    ("user", "user123", "success"),
    ("invalid", "wrong", "failure"),
    ("", "", "failure")
])
def test_login_scenarios(username, password, expected):
    """参数化登录测试"""
    # 模拟登录逻辑
    def mock_login(user, pwd):
        valid_users = {
            "admin": "admin123",
            "user": "user123"
        }
        if user in valid_users and valid_users[user] == pwd:
            return "success"
        else:
            return "failure"
    
    result = mock_login(username, password)
    assert result == expected
```

### 2. 夹具（Fixtures）

```python
import pytest
from selenium import webdriver

@pytest.fixture
def browser():
    """浏览器夹具"""
    driver = webdriver.Chrome()
    yield driver  # 返回驱动实例
    driver.quit()  # 测试完成后清理

@pytest.fixture(scope="class")
def test_data():
    """测试数据夹具"""
    return {
        "username": "testuser",
        "password": "testpass",
        "url": "https://example.com"
    }

def test_with_fixtures(browser, test_data):
    """使用夹具的测试"""
    browser.get(test_data["url"])
    # 使用browser进行测试
    assert "Example" in browser.title
```

### 3. 标记（Marks）

```python
import pytest

@pytest.mark.smoke
def test_critical_feature():
    """冒烟测试"""
    assert True

@pytest.mark.regression
def test_regression_feature():
    """回归测试"""
    assert True

@pytest.mark.slow
def test_time_consuming():
    """耗时测试"""
    import time
    time.sleep(2)
    assert True
```

```bash
# 只运行特定标记的测试
pytest -m smoke          # 只运行冒烟测试
pytest -m "not slow"     # 跳过慢测试
pytest -m "smoke or regression"  # 运行冒烟或回归测试
```

## 综合实战示例

```python
# test_comprehensive.py
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestWebApplication:
    
    @pytest.fixture(scope="class")
    def driver(self):
        """类级别的浏览器夹具"""
        driver = webdriver.Chrome()
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    
    @pytest.fixture
    def login_page(self, driver):
        """登录页面夹具"""
        driver.get("https://example.com/login")
        return driver
    
    @pytest.mark.smoke
    @pytest.mark.run(order=1)
    def test_page_title(self, login_page):
        """测试页面标题"""
        assert "Login" in login_page.title
    
    @pytest.mark.parametrize("username,password,expected_result", [
        ("admin", "admin123", "success"),
        ("user", "user123", "success"),
        ("invalid", "wrong", "failure")
    ])
    def test_login_scenarios(self, login_page, username, password, expected_result):
        """参数化登录测试"""
        # 清空并输入用户名
        username_field = login_page.find_element(By.ID, "username")
        username_field.clear()
        username_field.send_keys(username)
        
        # 清空并输入密码
        password_field = login_page.find_element(By.ID, "password")
        password_field.clear()
        password_field.send_keys(password)
        
        # 点击登录按钮
        login_button = login_page.find_element(By.ID, "login")
        login_button.click()
        
        # 验证结果
        if expected_result == "success":
            wait = WebDriverWait(login_page, 10)
            wait.until(EC.url_contains("dashboard"))
            assert "dashboard" in login_page.current_url
        else:
            error_element = login_page.find_element(By.CLASS_NAME, "error")
            assert error_element.is_displayed()
    
    @pytest.mark.regression
    @pytest.mark.flaky(reruns=2)
    def test_logout_functionality(self, driver):
        """测试登出功能"""
        # 先登录
        driver.get("https://example.com/login")
        driver.find_element(By.ID, "username").send_keys("admin")
        driver.find_element(By.ID, "password").send_keys("admin123")
        driver.find_element(By.ID, "login").click()
        
        # 等待登录完成
        wait = WebDriverWait(driver, 10)
        wait.until(EC.url_contains("dashboard"))
        
        # 执行登出
        logout_button = driver.find_element(By.ID, "logout")
        logout_button.click()
        
        # 验证返回登录页面
        wait.until(EC.url_contains("login"))
        assert "login" in driver.current_url
```

## 运行pytest测试

```bash
# 基本运行
pytest test_file.py

# 详细输出
pytest -v test_file.py

# 生成HTML报告
pytest --html=report.html --self-contained-html

# 运行特定标记的测试
pytest -m smoke

# 失败重试
pytest --reruns 3 --reruns-delay 1

# 并行执行（需要安装pytest-xdist）
pip install pytest-xdist
pytest -n 4  # 使用4个进程并行执行
```

## pytest vs unittest 总结

在当前业界，pytest已经成为Python自动化测试的首选框架，主要原因：

### pytest的优势
- **语法简洁**：无需继承类，函数即可成为测试
- **断言直观**：使用原生assert，失败时提供详细信息
- **插件丰富**：庞大的生态系统，功能扩展容易
- **Fixture强大**：依赖注入，作用域灵活
- **参数化简单**：轻松实现数据驱动测试

### unittest的局限
- **语法冗长**：必须继承TestCase类
- **断言复杂**：专用断言方法，可读性差
- **扩展困难**：插件生态相对有限
- **Fixture刚性**：setUp/tearDown耦合性高

因此，对于新项目，强烈推荐使用pytest作为测试框架。 