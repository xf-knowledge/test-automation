# pytest框架详解

> 本节详细介绍pytest测试框架，以简洁的语法和丰富的插件生态系统提供强大的测试能力。

## pytest框架简介

pytest是一个功能强大的第三方测试框架，以简洁的语法和丰富的插件生态系统著称。

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

### 2. 常用断言

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

### 2. pytest-rerunfailures（失败重试）

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

### 3. pytest-html（生成报告）

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

## pytest配置文件

### pytest.ini配置

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