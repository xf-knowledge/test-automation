# 第四章：单元测试框架

> 本章介绍unittest和pytest两大主流测试框架，为自动化测试提供结构化的组织和管理能力。

## unittest框架详解

### unittest框架简介

unittest是Python标准库内置的测试框架，无需额外安装，提供了完整的测试解决方案。

### 核心要素（五大组件）

#### 1. TestCase（测试用例）

**TestCase**是unittest框架的核心，所有测试都必须继承自`unittest.TestCase`类。

```python
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By

class LoginTest(unittest.TestCase):
    
    def setUp(self):
        """每个测试方法执行前调用"""
        self.driver = webdriver.Chrome()
        self.driver.get("https://example.com/login")
    
    def tearDown(self):
        """每个测试方法执行后调用"""
        self.driver.quit()
    
    def test_valid_login(self):
        """测试有效登录"""
        username = self.driver.find_element(By.ID, "username")
        password = self.driver.find_element(By.ID, "password")
        login_btn = self.driver.find_element(By.ID, "login")
        
        username.send_keys("testuser")
        password.send_keys("testpass")
        login_btn.click()
        
        # 断言登录成功
        self.assertIn("dashboard", self.driver.current_url)
    
    def test_invalid_login(self):
        """测试无效登录"""
        username = self.driver.find_element(By.ID, "username")
        password = self.driver.find_element(By.ID, "password")
        login_btn = self.driver.find_element(By.ID, "login")
        
        username.send_keys("wronguser")
        password.send_keys("wrongpass")
        login_btn.click()
        
        # 断言显示错误信息
        error_msg = self.driver.find_element(By.CLASS_NAME, "error")
        self.assertTrue(error_msg.is_displayed())
```

**TestCase生命周期方法**：

```python
class MyTest(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """整个测试类开始前执行一次"""
        print("测试类开始执行")
    
    @classmethod
    def tearDownClass(cls):
        """整个测试类结束后执行一次"""
        print("测试类执行完毕")
    
    def setUp(self):
        """每个测试方法执行前调用"""
        print("准备测试环境")
    
    def tearDown(self):
        """每个测试方法执行后调用"""
        print("清理测试环境")
    
    def test_example(self):
        """测试方法必须以test_开头"""
        self.assertEqual(1, 1)
```

#### 2. TestSuite（测试套件）

**TestSuite**用于组织和管理多个测试用例。

```python
def create_test_suite():
    """创建测试套件"""
    suite = unittest.TestSuite()
    
    # 添加单个测试方法
    suite.addTest(LoginTest('test_valid_login'))
    suite.addTest(LoginTest('test_invalid_login'))
    
    # 添加整个测试类
    suite.addTest(unittest.makeSuite(LoginTest))
    
    return suite

# 使用测试套件
if __name__ == '__main__':
    suite = create_test_suite()
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
```

#### 3. TestLoader（测试加载器）

**TestLoader**负责自动发现和加载测试。

```python
# 自动发现并加载测试
loader = unittest.TestLoader()

# 加载单个测试类
suite = loader.loadTestsFromTestCase(LoginTest)

# 加载模块中的所有测试
import test_module
suite = loader.loadTestsFromModule(test_module)

# 自动发现测试文件
suite = loader.discover('tests', pattern='test_*.py')

# 加载特定测试方法
suite = loader.loadTestsFromName('test_login.LoginTest.test_valid_login')
```

#### 4. TestRunner（测试运行器）

**TestRunner**负责执行测试并生成结果报告。

```python
# 基本文本运行器
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

# 带缓冲的运行器
runner = unittest.TextTestRunner(
    verbosity=2,
    buffer=True,  # 缓冲输出
    failfast=True  # 遇到失败立即停止
)

# 获取测试结果
print(f"运行测试数: {result.testsRun}")
print(f"失败数: {len(result.failures)}")
print(f"错误数: {len(result.errors)}")
```

#### 5. 断言（Assertions）

**断言**是验证测试结果的核心机制。

### unittest断言方法详解

#### 基本断言
```python
class TestAssertions(unittest.TestCase):
    
    def test_basic_assertions(self):
        # 相等断言
        self.assertEqual(actual, expected, "值不相等")
        self.assertNotEqual(actual, expected)
        
        # 真假断言
        self.assertTrue(expression, "表达式为假")
        self.assertFalse(expression, "表达式为真")
        
        # 空值断言
        self.assertIsNone(value, "值不为None")
        self.assertIsNotNone(value, "值为None")
        
        # 类型断言
        self.assertIsInstance(obj, class_type)
        self.assertNotIsInstance(obj, class_type)
```

#### 数值断言
```python
def test_numeric_assertions(self):
    # 大小比较
    self.assertGreater(a, b, "a不大于b")
    self.assertGreaterEqual(a, b)
    self.assertLess(a, b)
    self.assertLessEqual(a, b)
    
    # 近似相等（浮点数）
    self.assertAlmostEqual(3.14159, 3.14, places=2)
    self.assertNotAlmostEqual(3.14159, 3.15, places=2)
```

#### 字符串断言
```python
def test_string_assertions(self):
    text = "Hello World"
    
    # 包含断言
    self.assertIn("Hello", text, "文本不包含Hello")
    self.assertNotIn("Goodbye", text)
    
    # 正则匹配
    self.assertRegex(text, r"Hello.*World")
    self.assertNotRegex(text, r"^\d+$")
```

#### 异常断言
```python
def test_exception_assertions(self):
    # 断言抛出特定异常
    with self.assertRaises(ValueError):
        int("not_a_number")
    
    # 断言异常消息
    with self.assertRaisesRegex(ValueError, "invalid literal"):
        int("not_a_number")
```

### unittest完整示例

```python
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By

class WebTestCase(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """测试类级别的初始化"""
        cls.base_url = "https://example.com"
    
    def setUp(self):
        """每个测试前的准备"""
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
    
    def tearDown(self):
        """每个测试后的清理"""
        self.driver.quit()
    
    def test_page_title(self):
        """测试页面标题"""
        self.driver.get(self.base_url)
        self.assertIn("Example", self.driver.title)
    
    def test_login_success(self):
        """测试登录成功"""
        self.driver.get(f"{self.base_url}/login")
        
        # 输入用户名密码
        self.driver.find_element(By.ID, "username").send_keys("testuser")
        self.driver.find_element(By.ID, "password").send_keys("testpass")
        self.driver.find_element(By.ID, "login").click()
        
        # 断言登录成功
        self.assertIn("dashboard", self.driver.current_url)

if __name__ == '__main__':
    # 运行测试
    unittest.main(verbosity=2)
```

## pytest框架详解

### pytest框架简介

pytest是一个功能强大的第三方测试框架，以简洁的语法和丰富的插件生态系统著称。

```bash
# 安装pytest
pip install pytest
```

### pytest核心特点

#### 1. 简洁语法

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

#### 2. 常用断言

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

#### 3. 丰富的插件支持

pytest拥有强大的插件生态系统，满足各种测试需求。

### pytest核心插件

#### 1. pytest-ordering（控制执行顺序）

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

#### 2. pytest-rerunfailures（失败重试）

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

#### 3. pytest-html（生成报告）

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

### pytest高级功能

#### 1. 参数化测试

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

#### 2. 夹具（Fixtures）

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

#### 3. 标记（Marks）

```python
import pytest

@pytest.mark.smoke
def test_critical_feature():
    """冒烟测试"""
    assert True

@pytest.mark.regression
def test_existing_feature():
    """回归测试"""
    assert True

@pytest.mark.skip(reason="功能尚未实现")
def test_future_feature():
    """跳过的测试"""
    assert True

@pytest.mark.skipif(condition=True, reason="条件跳过")
def test_conditional():
    """条件跳过的测试"""
    assert True
```

```bash
# 运行特定标记的测试
pytest -m smoke          # 只运行冒烟测试
pytest -m "smoke or regression"  # 运行冒烟或回归测试
```

### pytest配置文件

#### pytest.ini配置

```ini
[tool:pytest]
# 测试发现规则
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*

# 命令行选项
addopts = -v --tb=short --strict-markers

# 自定义标记
markers =
    smoke: 冒烟测试
    regression: 回归测试
    slow: 标记运行缓慢的测试
```

### pytest vs unittest对比

| 特性         | unittest                 | pytest            |
| ------------ | ------------------------ | ----------------- |
| **安装**     | 内置                     | 需要安装          |
| **语法**     | 面向对象，需继承TestCase | 函数式，简洁直观  |
| **断言**     | 专门的断言方法           | 原生assert语句    |
| **测试发现** | 需要明确指定             | 自动发现          |
| **插件生态** | 有限                     | 丰富强大          |
| **参数化**   | 复杂                     | 简单易用          |
| **夹具**     | setUp/tearDown           | 强大的fixture系统 |
| **报告**     | 基础                     | 丰富的报告插件    |