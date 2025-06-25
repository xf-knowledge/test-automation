# 日志系统实战应用：从配置到实践

> **期末考试重点**：日志系统的综合配置和在自动化测试中的实际应用是考试的高频考点，必须掌握完整的配置流程和实用技巧。

## 标准日志配置模板

### 基础配置示例
```python
import logging
import os
from datetime import datetime

def setup_automation_logging():
    """自动化测试标准日志配置"""
    
    # 1. 创建日志目录
    log_dir = 'test_logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # 2. 生成带时间戳的日志文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = f'{log_dir}/automation_{timestamp}.log'
    
    # 3. 配置根记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.handlers.clear()  # 清除默认处理器
    
    # 4. 创建格式器
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    
    file_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 5. 配置控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)
    
    # 6. 配置文件处理器
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    
    # 7. 添加处理器
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    logging.info("="*50)
    logging.info("自动化测试日志系统启动")
    logging.info(f"日志文件：{log_file}")
    logging.info("="*50)
    
    return root_logger

# 使用示例
logger = setup_automation_logging()
```

## 企业级日志配置

### 生产级配置示例
```python
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import sys
import os

class ProductionLoggerConfig:
    """生产环境日志配置类"""
    
    def __init__(self, log_dir="logs", app_name="automation"):
        self.log_dir = log_dir
        self.app_name = app_name
        self._ensure_log_directory()
    
    def _ensure_log_directory(self):
        """确保日志目录存在"""
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
    
    def setup_logger(self, logger_name="root", level=logging.INFO):
        """配置生产级日志系统"""
        logger = logging.getLogger(logger_name)
        logger.setLevel(level)
        logger.handlers.clear()
        
        # 添加多种处理器
        self._add_console_handler(logger)
        self._add_rotating_file_handler(logger)
        self._add_error_file_handler(logger)
        self._add_timed_file_handler(logger)
        
        return logger
    
    def _add_console_handler(self, logger):
        """添加控制台处理器"""
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.WARNING)  # 控制台只显示警告及以上
        
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    def _add_rotating_file_handler(self, logger):
        """添加按大小轮转的文件处理器"""
        handler = RotatingFileHandler(
            os.path.join(self.log_dir, f'{self.app_name}.log'),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        handler.setLevel(logging.DEBUG)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    def _add_error_file_handler(self, logger):
        """添加错误专用文件处理器"""
        handler = RotatingFileHandler(
            os.path.join(self.log_dir, f'{self.app_name}_error.log'),
            maxBytes=5*1024*1024,   # 5MB
            backupCount=3,
            encoding='utf-8'
        )
        handler.setLevel(logging.ERROR)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s - %(message)s\n'
            '%(pathname)s\n'
            'Exception: %(exc_info)s\n' + '-'*80,
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    def _add_timed_file_handler(self, logger):
        """添加按时间轮转的文件处理器"""
        handler = TimedRotatingFileHandler(
            os.path.join(self.log_dir, f'{self.app_name}_daily.log'),
            when='D',
            interval=1,
            backupCount=30,  # 保留30天
            encoding='utf-8'
        )
        handler.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

# 使用生产级配置
config = ProductionLoggerConfig()
logger = config.setup_logger("automation_test")
```

## 测试用例中的日志应用

### 基础日志集成
```python
import logging
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By

class TestWithLogging(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """测试类初始化"""
        cls.logger = logging.getLogger(cls.__name__)
        cls.logger.setLevel(logging.DEBUG)
        
        # 配置处理器
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - [%(name)s] - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        cls.logger.addHandler(handler)
        
        cls.logger.info("="*50)
        cls.logger.info(f"开始执行测试类：{cls.__name__}")
        
        # 初始化WebDriver
        cls.driver = webdriver.Chrome()
        cls.logger.info("WebDriver初始化完成")
    
    def setUp(self):
        """测试用例初始化"""
        self.logger.info(f"开始执行测试用例：{self._testMethodName}")
    
    def tearDown(self):
        """测试用例清理"""
        # 检查测试结果
        if hasattr(self, '_outcome'):
            if self._outcome.errors or self._outcome.failures:
                self.logger.error(f"测试用例失败：{self._testMethodName}")
                # 保存错误截图
                screenshot_path = f"error_{self._testMethodName}.png"
                self.driver.save_screenshot(screenshot_path)
                self.logger.error(f"错误截图已保存：{screenshot_path}")
            else:
                self.logger.info(f"测试用例通过：{self._testMethodName}")
    
    @classmethod
    def tearDownClass(cls):
        """测试类清理"""
        cls.logger.info(f"测试类执行完成：{cls.__name__}")
        cls.driver.quit()
        cls.logger.info("WebDriver已关闭")
        cls.logger.info("="*50)
    
    def test_page_title(self):
        """测试页面标题"""
        try:
            self.logger.info("导航到目标页面")
            self.driver.get("https://www.baidu.com")
            
            self.logger.debug(f"当前URL：{self.driver.current_url}")
            
            title = self.driver.title
            self.logger.info(f"页面标题：{title}")
            
            self.assertIn("百度", title)
            self.logger.info("标题验证通过")
            
        except Exception as e:
            self.logger.error(f"测试执行异常：{e}")
            raise
```

### 高级日志装饰器
```python
import logging
import functools
import time

def log_test_step(step_name):
    """测试步骤日志装饰器"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(func.__module__)
            logger.info(f"开始执行步骤：{step_name}")
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                end_time = time.time()
                duration = end_time - start_time
                logger.info(f"步骤完成：{step_name}，耗时：{duration:.2f}秒")
                return result
            except Exception as e:
                logger.error(f"步骤失败：{step_name}，异常：{e}")
                raise
        return wrapper
    return decorator

def log_performance(threshold=1.0):
    """性能监控装饰器"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(func.__module__)
            start_time = time.time()
            
            result = func(*args, **kwargs)
            
            end_time = time.time()
            duration = end_time - start_time
            
            if duration > threshold:
                logger.warning(f"性能警告：{func.__name__} 执行时间 {duration:.2f}秒，超过阈值 {threshold}秒")
            else:
                logger.debug(f"性能正常：{func.__name__} 执行时间 {duration:.2f}秒")
            
            return result
        return wrapper
    return decorator

# 使用装饰器示例
class LoginTest:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    @log_test_step("打开登录页面")
    @log_performance(threshold=3.0)
    def open_login_page(self, url):
        """打开登录页面"""
        time.sleep(1)  # 模拟页面加载
        self.logger.debug(f"导航到：{url}")
    
    @log_test_step("输入登录凭据")
    def input_credentials(self, username, password):
        """输入登录凭据"""
        self.logger.debug(f"用户名：{username}")
        self.logger.debug("密码：***")
    
    @log_test_step("验证登录结果")
    def verify_login_result(self):
        """验证登录结果"""
        self.logger.debug("检查登录状态")
        return True

# 执行测试
test = LoginTest()
test.open_login_page("https://example.com/login")
test.input_credentials("testuser", "testpass")
test.verify_login_result()
```

## 日志最佳实践指南

### 1. 日志级别选择原则
```python
# ✅ 正确的日志级别使用
def good_logging_practice():
    logger = logging.getLogger(__name__)
    
    # DEBUG：详细的调试信息
    logger.debug("开始元素定位：By.ID='username'")
    
    # INFO：关键的业务流程
    logger.info("用户登录成功")
    
    # WARNING：需要注意但不影响功能的问题
    logger.warning("页面加载时间超过3秒")
    
    # ERROR：功能执行失败
    logger.error("登录失败：用户名或密码错误")
    
    # CRITICAL：系统级严重错误
    logger.critical("数据库连接失败，测试无法继续")

# ❌ 错误的日志级别使用
def bad_logging_practice():
    logger = logging.getLogger(__name__)
    
    # 错误：用ERROR记录正常信息
    logger.error("用户登录成功")  # 应该用INFO
    
    # 错误：用DEBUG记录重要信息
    logger.debug("测试执行完成")  # 应该用INFO
    
    # 错误：用CRITICAL记录普通错误
    logger.critical("按钮点击失败")  # 应该用ERROR
```

### 2. 性能优化建议
```python
# ✅ 高效的日志记录
def efficient_logging():
    logger = logging.getLogger(__name__)
    
    # 使用参数化格式
    logger.info("用户 %s 登录成功，耗时 %.2f 秒", username, duration)
    
    # 避免昂贵的字符串操作
    if logger.isEnabledFor(logging.DEBUG):
        logger.debug("复杂数据：%s", expensive_function())

# ❌ 低效的日志记录
def inefficient_logging():
    logger = logging.getLogger(__name__)
    
    # 总是执行字符串拼接
    logger.debug("复杂数据：" + expensive_function())  # 即使不输出也会执行
    
    # 使用f-string（在日志中不推荐）
    logger.debug(f"用户 {username} 登录")  # 总是会格式化
```

### 3. 错误处理集成
```python
def error_handling_with_logging():
    """错误处理与日志的正确集成"""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("开始执行关键操作")
        # 执行可能失败的操作
        result = risky_operation()
        logger.info("操作执行成功")
        return result
        
    except ValueError as e:
        logger.error("参数错误：%s", e)
        raise
    except ConnectionError as e:
        logger.critical("连接失败：%s", e)
        raise
    except Exception as e:
        logger.error("未知错误：%s", e, exc_info=True)  # 包含堆栈信息
        raise
    finally:
        logger.debug("操作清理完成")
```

### 4. 敏感信息保护
```python
import re

class SecureLogger:
    """安全日志记录器"""
    
    def __init__(self, logger_name):
        self.logger = logging.getLogger(logger_name)
        self.sensitive_patterns = [
            (re.compile(r'password["\']?\s*[:=]\s*["\']?([^"\s,}]+)', re.I), 'password=***'),
            (re.compile(r'token["\']?\s*[:=]\s*["\']?([^"\s,}]+)', re.I), 'token=***'),
            (re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'), '****-****-****-****'),
        ]
    
    def _sanitize_message(self, message):
        """清理敏感信息"""
        for pattern, replacement in self.sensitive_patterns:
            message = pattern.sub(replacement, message)
        return message
    
    def info(self, message, *args, **kwargs):
        """安全的info日志"""
        clean_message = self._sanitize_message(message)
        self.logger.info(clean_message, *args, **kwargs)
    
    def error(self, message, *args, **kwargs):
        """安全的error日志"""
        clean_message = self._sanitize_message(message)
        self.logger.error(clean_message, *args, **kwargs)

# 使用安全日志记录器
secure_logger = SecureLogger("security_test")
secure_logger.info("登录请求：username=admin, password=secret123")  # 自动脱敏
```

## 日志分析与监控

### 日志文件分析脚本
```python
import re
from collections import Counter, defaultdict
from datetime import datetime

class LogAnalyzer:
    """日志分析器"""
    
    def __init__(self, log_file):
        self.log_file = log_file
        self.log_pattern = re.compile(
            r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - (\w+) - (.+)'
        )
    
    def analyze_log_levels(self):
        """分析日志级别分布"""
        level_counts = Counter()
        
        with open(self.log_file, 'r', encoding='utf-8') as f:
            for line in f:
                match = self.log_pattern.match(line.strip())
                if match:
                    level = match.group(2)
                    level_counts[level] += 1
        
        return level_counts
    
    def find_errors(self):
        """查找错误日志"""
        errors = []
        
        with open(self.log_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                match = self.log_pattern.match(line.strip())
                if match and match.group(2) in ['ERROR', 'CRITICAL']:
                    errors.append({
                        'line': line_num,
                        'timestamp': match.group(1),
                        'level': match.group(2),
                        'message': match.group(3)
                    })
        
        return errors
    
    def generate_report(self):
        """生成分析报告"""
        level_counts = self.analyze_log_levels()
        errors = self.find_errors()
        
        print("="*50)
        print("日志分析报告")
        print("="*50)
        print("\n级别分布：")
        for level, count in level_counts.most_common():
            print(f"  {level}: {count}")
        
        print(f"\n错误数量：{len(errors)}")
        if errors:
            print("\n最近错误：")
            for error in errors[-5:]:  # 显示最近5个错误
                print(f"  [{error['timestamp']}] {error['level']}: {error['message'][:100]}...")

# 使用日志分析器
# analyzer = LogAnalyzer('automation.log')
# analyzer.generate_report()
```

通过这些实战配置和最佳实践，您可以构建一个专业、高效、安全的日志系统，为自动化测试提供强有力的支持。 