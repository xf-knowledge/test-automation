# unittest框架详解

> 本节详细介绍Python内置的unittest测试框架，为自动化测试提供结构化的组织方式。

## unittest框架简介

unittest是Python标准库内置的测试框架，无需额外安装，提供了完整的测试解决方案。

## 核心要素（五大组件）

### 1. TestCase（测试用例）

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

### TestCase生命周期方法

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

### 2. TestSuite（测试套件）

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

### 3. TestLoader（测试加载器）

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

### 4. TestRunner（测试运行器）

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

### 5. 断言（Assertions）

**断言**是验证测试结果的核心机制。

## unittest断言方法详解

### 基本断言
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

### 数值断言
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

### 字符串断言
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

### 异常断言
```python
def test_exception_assertions(self):
    # 断言抛出特定异常
    with self.assertRaises(ValueError):
        int("not_a_number")
    
    # 断言异常消息
    with self.assertRaisesRegex(ValueError, "invalid literal"):
        int("not_a_number")
```

## unittest完整示例

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