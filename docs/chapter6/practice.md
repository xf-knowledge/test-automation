# 日志配置实践与最佳实践

> 本节提供完整的日志配置示例，并总结日志系统在自动化测试中的最佳实践指南。

## 完整日志配置示例

### 基础配置
```python
import logging
import os
from datetime import datetime

def setup_logging():
    """配置测试自动化日志系统"""
    
    # 创建日志目录
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # 生成日志文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = f'{log_dir}/test_{timestamp}.log'
    
    # 创建记录器
    logger = logging.getLogger('test_automation')
    logger.setLevel(logging.DEBUG)
    
    # 清除已有的处理器
    logger.handlers.clear()
    
    # 创建格式器
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 控制台处理器（显示INFO及以上级别）
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # 文件处理器（记录所有级别）
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # 添加处理器
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger

# 使用示例
logger = setup_logging()

# 在测试中使用
def test_login():
    logger.info("开始执行登录测试")
    try:
        # 测试步骤
        logger.debug("定位用户名输入框")
        # ... 测试代码 ...
        logger.info("登录测试执行成功")
    except Exception as e:
        logger.error(f"登录测试失败: {e}")
        raise
```

### 高级配置示例
```python
import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

class AutomationLogger:
    """自动化测试日志管理类"""
    
    def __init__(self, name="automation", log_dir="logs"):
        self.name = name
        self.log_dir = log_dir
        self.logger = None
        self._setup_logging()
    
    def _setup_logging(self):
        """设置日志配置"""
        # 创建日志目录
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
        
        # 创建记录器
        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(logging.DEBUG)
        self.logger.handlers.clear()
        
        # 添加各种处理器
        self._add_console_handler()
        self._add_file_handlers()
        self._add_error_handler()
    
    def _add_console_handler(self):
        """添加控制台处理器"""
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # 彩色格式器
        console_formatter = self._create_colored_formatter()
        console_handler.setFormatter(console_formatter)
        
        self.logger.addHandler(console_handler)
    
    def _add_file_handlers(self):
        """添加文件处理器"""
        # 详细日志文件（轮转）
        debug_handler = RotatingFileHandler(
            os.path.join(self.log_dir, 'debug.log'),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        debug_handler.setLevel(logging.DEBUG)
        
        # 日常日志文件（按时间轮转）
        info_handler = TimedRotatingFileHandler(
            os.path.join(self.log_dir, 'automation.log'),
            when='D',
            interval=1,
            backupCount=30,
            encoding='utf-8'
        )
        info_handler.setLevel(logging.INFO)
        
        # 文件格式器
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s() - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        debug_handler.setFormatter(file_formatter)
        info_handler.setFormatter(file_formatter)
        
        self.logger.addHandler(debug_handler)
        self.logger.addHandler(info_handler)
    
    def _add_error_handler(self):
        """添加错误日志处理器"""
        error_handler = RotatingFileHandler(
            os.path.join(self.log_dir, 'error.log'),
            maxBytes=5*1024*1024,   # 5MB
            backupCount=3,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        
        error_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s\n%(exc_info)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        error_handler.setFormatter(error_formatter)
        
        self.logger.addHandler(error_handler)
    
    def _create_colored_formatter(self):
        """创建彩色格式器"""
        class ColoredFormatter(logging.Formatter):
            COLORS = {
                'DEBUG': '\033[36m',    # 青色
                'INFO': '\033[32m',     # 绿色
                'WARNING': '\033[33m',  # 黄色
                'ERROR': '\033[31m',    # 红色
                'CRITICAL': '\033[35m', # 紫色
            }
            RESET = '\033[0m'
            
            def format(self, record):
                color = self.COLORS.get(record.levelname, self.RESET)
                record.levelname = f"{color}{record.levelname}{self.RESET}"
                return super().format(record)
        
        return ColoredFormatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%H:%M:%S'
        )
    
    def get_logger(self):
        """获取日志记录器"""
        return self.logger

# 使用高级配置
automation_logger = AutomationLogger()
logger = automation_logger.get_logger()
```

### 测试用例中的日志应用
```python
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By

def test_search_with_logging():
    """带有完整日志记录的搜索测试"""
    logger = logging.getLogger('test_automation')
    
    logger.info("="*50)
    logger.info("开始执行搜索功能测试")
    
    driver = webdriver.Chrome()
    try:
        logger.debug("浏览器启动成功")
        
        logger.info("导航到百度首页")
        driver.get("https://www.baidu.com")
        logger.debug(f"当前页面URL: {driver.current_url}")
        
        logger.info("开始搜索操作")
        search_box = driver.find_element(By.ID, "kw")
        search_keyword = "Python自动化测试"
        
        logger.debug(f"输入搜索关键词: {search_keyword}")
        search_box.send_keys(search_keyword)
        
        logger.debug("点击搜索按钮")
        driver.find_element(By.ID, "su").click()
        
        logger.info("搜索执行完成")
        logger.debug(f"搜索结果页面URL: {driver.current_url}")
        
        # 验证搜索结果
        results = driver.find_elements(By.CSS_SELECTOR, ".result")
        logger.info(f"搜索结果数量: {len(results)}")
        
        if len(results) > 0:
            logger.info("搜索测试执行成功")
        else:
            logger.warning("未找到搜索结果")
            
    except Exception as e:
        logger.error(f"搜索测试执行失败: {e}", exc_info=True)
        raise
    finally:
        logger.debug("关闭浏览器")
        driver.quit()
        logger.info("搜索测试执行结束")
```

## 测试框架集成

### 与unittest集成
```python
import unittest
import logging

class LoggedTestCase(unittest.TestCase):
    """带有日志功能的测试基类"""
    
    @classmethod
    def setUpClass(cls):
        """类级别设置"""
        cls.logger = logging.getLogger(f'test.{cls.__name__}')
        cls.logger.setLevel(logging.DEBUG)
        
        if not cls.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            cls.logger.addHandler(handler)
    
    def setUp(self):
        """每个测试方法前执行"""
        test_method = self._testMethodName
        self.logger.info(f"开始执行测试: {test_method}")
    
    def tearDown(self):
        """每个测试方法后执行"""
        test_method = self._testMethodName
        if hasattr(self, '_outcome'):
            if self._outcome.errors or self._outcome.failures:
                self.logger.error(f"测试失败: {test_method}")
            else:
                self.logger.info(f"测试成功: {test_method}")

class TestLogin(LoggedTestCase):
    """登录功能测试"""
    
    def test_valid_login(self):
        """测试有效登录"""
        self.logger.info("执行有效登录测试")
        # 测试逻辑
        self.assertTrue(True)
    
    def test_invalid_login(self):
        """测试无效登录"""
        self.logger.info("执行无效登录测试")
        # 测试逻辑
        self.assertTrue(True)
```

### 与pytest集成
```python
import pytest
import logging

@pytest.fixture(scope="session")
def logger():
    """会话级日志器fixture"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger('pytest.automation')

@pytest.fixture(autouse=True)
def log_test_info(request, logger):
    """自动记录测试信息"""
    test_name = request.node.name
    logger.info(f"开始执行测试: {test_name}")
    
    yield
    
    # 测试结束后记录结果
    if hasattr(request.node, 'rep_call'):
        if request.node.rep_call.failed:
            logger.error(f"测试失败: {test_name}")
        else:
            logger.info(f"测试成功: {test_name}")

def test_example_with_logging(logger):
    """带日志的测试示例"""
    logger.info("执行测试步骤1")
    logger.debug("详细调试信息")
    logger.info("测试完成")
    assert True
```

## 最佳实践

### 1. 实践建议

#### 合理设置日志级别
```python
# 开发阶段：使用DEBUG级别
logging.basicConfig(level=logging.DEBUG)

# 测试阶段：使用INFO级别
logging.basicConfig(level=logging.INFO)

# 生产环境：使用WARNING级别
logging.basicConfig(level=logging.WARNING)
```

#### 统一日志格式
```python
# 团队统一的日志格式
STANDARD_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'

# 在配置文件中定义
class LogConfig:
    FORMAT = STANDARD_FORMAT
    DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    LEVEL = logging.INFO
```

#### 敏感信息保护
```python
def safe_log_credentials(username, password, logger):
    """安全记录登录凭据"""
    logger.info(f"尝试登录用户: {username}")
    # 不要记录密码
    # logger.info(f"密码: {password}")  # ❌ 不要这样做
    logger.debug("密码已设置")  # ✅ 这样是安全的
```

#### 异常信息记录
```python
try:
    # 可能出错的代码
    risky_operation()
except Exception as e:
    # 记录完整的异常堆栈
    logger.error(f"操作失败: {e}", exc_info=True)
    raise
```

### 2. 文件管理策略

#### 日志文件轮转
```python
from logging.handlers import RotatingFileHandler

# 按大小轮转
rotating_handler = RotatingFileHandler(
    'app.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5           # 保留5个文件
)

# 按时间轮转
from logging.handlers import TimedRotatingFileHandler

timed_handler = TimedRotatingFileHandler(
    'app.log',
    when='D',       # 按天轮转
    interval=1,     # 每1天
    backupCount=30  # 保留30天
)
```

#### 日志清理策略
```python
import os
import glob
from datetime import datetime, timedelta

def cleanup_old_logs(log_dir='logs', days_to_keep=7):
    """清理旧日志文件"""
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    
    for log_file in glob.glob(os.path.join(log_dir, '*.log*')):
        file_time = datetime.fromtimestamp(os.path.getctime(log_file))
        if file_time < cutoff_date:
            try:
                os.remove(log_file)
                print(f"删除旧日志文件: {log_file}")
            except OSError as e:
                print(f"删除文件失败: {e}")

# 在测试开始前清理
cleanup_old_logs()
```

### 3. 性能优化

#### 避免不必要的字符串操作
```python
# ❌ 不推荐：总是执行字符串格式化
logger.debug("处理数据: " + str(large_data))

# ✅ 推荐：使用参数化日志
logger.debug("处理数据: %s", large_data)

# ✅ 推荐：检查日志级别
if logger.isEnabledFor(logging.DEBUG):
    logger.debug("处理数据: %s", expensive_operation())
```

#### 异步日志处理
```python
import logging
from logging.handlers import QueueHandler, QueueListener
import queue
import threading

def setup_async_logging():
    """设置异步日志处理"""
    # 创建队列
    log_queue = queue.Queue()
    
    # 创建队列处理器
    queue_handler = QueueHandler(log_queue)
    
    # 创建实际的日志处理器
    file_handler = logging.FileHandler('async.log')
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    
    # 创建队列监听器
    queue_listener = QueueListener(log_queue, file_handler)
    queue_listener.start()
    
    # 配置根记录器
    root_logger = logging.getLogger()
    root_logger.addHandler(queue_handler)
    root_logger.setLevel(logging.DEBUG)
    
    return queue_listener

# 使用异步日志
listener = setup_async_logging()
logger = logging.getLogger('async_test')

# 测试结束时停止监听器
# listener.stop()
```

### 4. 常见问题与解决方案

#### 日志重复输出
```python
# 问题：重复添加处理器导致日志重复
logger = logging.getLogger('test')
logger.addHandler(handler)  # 第一次添加
logger.addHandler(handler)  # 重复添加，导致重复输出

# 解决方案：检查是否已有处理器
logger = logging.getLogger('test')
if not logger.handlers:
    logger.addHandler(handler)

# 或者清除现有处理器
logger.handlers.clear()
logger.addHandler(handler)
```

#### 中文乱码问题
```python
# 解决中文乱码
file_handler = logging.FileHandler('test.log', encoding='utf-8')

# 控制台中文显示
import sys
sys.stdout.reconfigure(encoding='utf-8')
```

#### 日志级别不生效
```python
# 确保记录器和处理器的级别都正确设置
logger.setLevel(logging.DEBUG)      # 记录器级别
handler.setLevel(logging.DEBUG)     # 处理器级别

# 检查根记录器级别
logging.getLogger().setLevel(logging.DEBUG)
```

### 5. 监控与分析

#### 日志分析工具集成
```python
def analyze_test_logs(log_file):
    """分析测试日志"""
    stats = {
        'total_tests': 0,
        'passed_tests': 0,
        'failed_tests': 0,
        'errors': [],
        'warnings': []
    }
    
    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            if '开始执行测试' in line:
                stats['total_tests'] += 1
            elif '测试成功' in line:
                stats['passed_tests'] += 1
            elif '测试失败' in line or 'ERROR' in line:
                stats['failed_tests'] += 1
                stats['errors'].append(line.strip())
            elif 'WARNING' in line:
                stats['warnings'].append(line.strip())
    
    return stats

# 生成测试报告
log_stats = analyze_test_logs('test.log')
print(f"测试统计: {log_stats}")
```

## 总结

### 关键要点
1. **分层配置**：根据环境（开发/测试/生产）选择合适的日志级别
2. **多重输出**：同时使用控制台和文件处理器，满足不同需求
3. **格式统一**：团队使用一致的日志格式，便于分析和维护
4. **安全第一**：避免记录敏感信息，使用过滤器保护数据
5. **性能考虑**：合理使用日志级别，避免性能影响

### 实施建议
1. **从简单开始**：先实现基础的控制台和文件日志
2. **逐步完善**：根据需要添加轮转、过滤等高级功能
3. **团队规范**：制定团队的日志记录规范和标准
4. **定期维护**：定期清理日志文件，监控日志系统性能
5. **持续改进**：根据实际使用情况优化日志配置 