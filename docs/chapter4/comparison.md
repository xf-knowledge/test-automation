# 框架对比与选择指南

> 本节对比unittest和pytest两个测试框架的特点，帮助选择合适的测试框架。

## unittest vs pytest 详细对比

| 特性           | unittest                 | pytest                    |
| -------------- | ------------------------ | ------------------------- |
| **安装方式**   | 内置，无需安装           | 需要安装 `pip install pytest` |
| **语法风格**   | 面向对象，需继承TestCase | 函数式，简洁直观          |
| **断言方式**   | 专门的断言方法           | 原生assert语句            |
| **测试发现**   | 需要明确指定             | 自动发现                  |
| **插件生态**   | 有限                     | 丰富强大                  |
| **参数化测试** | 复杂，需要额外代码       | 简单易用，@parametrize    |
| **夹具系统**   | setUp/tearDown           | 强大的fixture系统         |
| **报告功能**   | 基础文本报告             | 丰富的报告插件            |
| **执行控制**   | 基本功能                 | 丰富的标记和过滤选项      |
| **学习曲线**   | 较陡峭                   | 较平缓                    |

## 具体特性对比

### 1. 语法对比

#### unittest写法
```python
import unittest

class TestExample(unittest.TestCase):
    
    def setUp(self):
        self.data = [1, 2, 3, 4, 5]
    
    def test_list_length(self):
        self.assertEqual(len(self.data), 5)
    
    def test_contains_element(self):
        self.assertIn(3, self.data)

if __name__ == '__main__':
    unittest.main()
```

#### pytest写法
```python
import pytest

@pytest.fixture
def data():
    return [1, 2, 3, 4, 5]

def test_list_length(data):
    assert len(data) == 5

def test_contains_element(data):
    assert 3 in data
```

### 2. 断言对比

#### unittest断言
```python
# 需要记住多种断言方法
self.assertEqual(a, b)
self.assertNotEqual(a, b)
self.assertTrue(x)
self.assertFalse(x)
self.assertIn(item, container)
self.assertIsNone(x)
self.assertRaises(Exception)
```

#### pytest断言
```python
# 使用原生assert，更直观
assert a == b
assert a != b
assert x
assert not x
assert item in container
assert x is None

with pytest.raises(Exception):
    # 代码块
```

### 3. 参数化测试对比

#### unittest参数化（复杂）
```python
import unittest

class TestLogin(unittest.TestCase):
    
    def test_login_scenarios(self):
        test_cases = [
            ("admin", "admin123", True),
            ("user", "user123", True),
            ("invalid", "wrong", False),
        ]
        
        for username, password, expected in test_cases:
            with self.subTest(username=username):
                result = login(username, password)
                self.assertEqual(result, expected)
```

#### pytest参数化（简洁）
```python
import pytest

@pytest.mark.parametrize("username,password,expected", [
    ("admin", "admin123", True),
    ("user", "user123", True),
    ("invalid", "wrong", False),
])
def test_login_scenarios(username, password, expected):
    result = login(username, password)
    assert result == expected
```

## 选择指南

### 选择unittest的场景

#### ✅ 适合使用unittest的情况：

1. **团队习惯**：团队已经熟悉unittest
2. **环境限制**：不能安装第三方包的环境
3. **简单项目**：测试需求较简单，不需要复杂功能
4. **标准化要求**：需要使用Python标准库

#### 示例项目结构：
```
project/
├── src/
│   └── calculator.py
├── tests/
│   ├── __init__.py
│   ├── test_calculator.py
│   └── test_suite.py
└── run_tests.py
```

### 选择pytest的场景

#### ✅ 适合使用pytest的情况：

1. **复杂测试需求**：需要参数化、夹具等高级功能
2. **团队协作**：多人协作，需要清晰的测试报告
3. **持续集成**：需要与CI/CD系统集成
4. **插件需求**：需要使用各种测试插件
5. **现代化项目**：追求简洁、高效的测试代码

#### 示例项目结构：
```
project/
├── src/
│   └── calculator.py
├── tests/
│   ├── conftest.py
│   ├── test_calculator.py
│   └── test_integration.py
├── pytest.ini
└── requirements.txt
```

## 迁移指南

### 从unittest迁移到pytest

1. **安装pytest**
   ```bash
   pip install pytest
   ```

2. **保持现有代码**：pytest兼容unittest测试
   ```python
   # 现有的unittest代码可以直接运行
   import unittest
   
   class TestExample(unittest.TestCase):
       def test_something(self):
           self.assertEqual(1, 1)
   
   # 使用pytest运行
   # pytest test_file.py
   ```

3. **逐步改写**：将unittest语法改为pytest语法
   ```python
   # 从这样
   class TestExample(unittest.TestCase):
       def test_something(self):
           self.assertEqual(1, 1)
   
   # 改为这样
   def test_something():
       assert 1 == 1
   ```

## 实际项目建议

### 新项目建议
- **推荐pytest**：功能强大，语法简洁，生态丰富
- 除非有特殊限制，否则优先选择pytest

### 已有项目建议
- **unittest项目**：如果运行良好，可以继续使用
- **逐步迁移**：pytest兼容unittest，可以逐步迁移
- **混合使用**：在同一项目中可以同时使用两种框架

### 团队决策因素

1. **团队技能**：团队对哪个框架更熟悉
2. **项目复杂度**：复杂项目更适合pytest
3. **时间成本**：学习和迁移的时间成本
4. **长期维护**：考虑未来的维护和扩展需求 