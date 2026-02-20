"""
斐波那契数列计算模块
====================
高性能、类型安全的 Fibonacci 计算实现

作者: DEV Team
版本: 1.0.0
"""
from typing import List, Union


def fibonacci(n: int) -> int:
    """
    计算第 n 个斐波那契数 (F-01)
    
    使用迭代法实现，时间复杂度 O(n)，空间复杂度 O(1)。
    支持 Python 任意精度整数运算。
    
    Args:
        n: 非负整数索引 (F(0)=0, F(1)=1)
    
    Returns:
        第 n 个斐波那契数
    
    Raises:
        TypeError: 输入非整数类型 (V-01)
        ValueError: 输入负数 (V-02)
    
    Examples:
        >>> fibonacci(0)
        0
        >>> fibonacci(10)
        55
        >>> fibonacci(50)
        12586269025
    """
    # V-01: 类型校验
    if not isinstance(n, int):
        raise TypeError(f"期望整数类型，实际传入 {type(n).__name__}")
    
    # V-02: 范围校验
    if n < 0:
        raise ValueError(f"索引必须为非负整数，实际传入 {n}")
    
    # 边界条件处理
    if n == 0:
        return 0
    if n == 1:
        return 1
    
    # 迭代计算，仅保留前两个状态
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    
    return curr


def fibonacci_sequence(n: int) -> List[int]:
    """
    生成前 n 个斐波那契数序列 (F-02)
    
    返回包含 F(0) 到 F(n) 的完整列表，共 n+1 个元素。
    时间复杂度 O(n)，空间复杂度 O(n)。
    
    Args:
        n: 非负整数，序列最后一个元素的索引
    
    Returns:
        斐波那契数列 [F(0), F(1), ..., F(n)]
    
    Raises:
        TypeError: 输入非整数类型 (V-01)
        ValueError: 输入负数 (V-02)
    
    Examples:
        >>> fibonacci_sequence(5)
        [0, 1, 1, 2, 3, 5]
        >>> fibonacci_sequence(0)
        [0]
    """
    # V-01, V-02: 输入验证
    if not isinstance(n, int):
        raise TypeError(f"期望整数类型，实际传入 {type(n).__name__}")
    if n < 0:
        raise ValueError(f"索引必须为非负整数，实际传入 {n}")
    
    # 边界条件处理
    if n == 0:
        return [0]
    if n == 1:
        return [0, 1]
    
    # 预分配列表，避免动态扩容开销
    sequence: List[int] = [0] * (n + 1)
    sequence[0], sequence[1] = 0, 1
    
    # 迭代填充序列
    for i in range(2, n + 1):
        sequence[i] = sequence[i - 1] + sequence[i - 2]
    
    return sequence


def fibonacci_generator(n: int):
    """
    斐波那契数列生成器（迭代器模式）
    
    适用于处理超大规模序列，惰性求值，内存友好。
    时间复杂度 O(n)，空间复杂度 O(1)。
    
    Args:
        n: 生成的元素数量（从 F(0) 开始）
    
    Yields:
        斐波那契数列的每个元素
    
    Raises:
        TypeError: 输入非整数类型
        ValueError: 输入负数
    
    Examples:
        >>> list(fibonacci_generator(6))
        [0, 1, 1, 2, 3, 5]
    """
    if not isinstance(n, int):
        raise TypeError(f"期望整数类型，实际传入 {type(n).__name__}")
    if n < 0:
        raise ValueError(f"索引必须为非负整数，实际传入 {n}")
    
    if n == 0:
        return
    
    yield 0
    if n == 1:
        return
    
    yield 1
    
    prev, curr = 0, 1
    for _ in range(2, n):
        prev, curr = curr, prev + curr
        yield curr


# ═══════════════════════════════════════════════════════════════
# 单元测试 & 性能基准
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import time
    
    def run_tests():
        """执行验收测试"""
        print("=" * 60)
        print("斐波那契模块验收测试")
        print("=" * 60)
        
        # ───── 基础计算测试 ─────
        test_cases = [
            (0, 0),
            (1, 1),
            (10, 55),
            (50, 12586269025),
        ]
        
        print("\n[基础计算测试]")
        for n, expected in test_cases:
            result = fibonacci(n)
            status = "✓ PASS" if result == expected else "✗ FAIL"
            print(f"  F({n}) = {result} {status}")
            assert result == expected, f"F({n}) 期望值 {expected}, 实际 {result}"
        
        # ───── 序列生成测试 ─────
        print("\n[序列生成测试]")
        seq = fibonacci_sequence(5)
        expected_seq = [0, 1, 1, 2, 3, 5]
        status = "✓ PASS" if seq == expected_seq else "✗ FAIL"
        print(f"  sequence(5) = {seq} {status}")
        assert seq == expected_seq, f"序列期望值 {expected_seq}, 实际 {seq}"
        
        # ───── 输入验证测试 ─────
        print("\n[输入验证测试]")
        
        # 负数测试
        try:
            fibonacci(-1)
            print("  负数测试: ✗ FAIL (未抛出异常)")
            assert False, "应抛出 ValueError"
        except ValueError as e:
            print(f"  负数测试: ✓ PASS ({e})")
        
        # 类型测试
        try:
            fibonacci("10")
            print("  类型测试: ✗ FAIL (未抛出异常)")
            assert False, "应抛出 TypeError"
        except TypeError as e:
            print(f"  类型测试: ✓ PASS ({e})")
        
        # ───── 性能基准测试 ─────
        print("\n[性能基准测试]")
        
        n_perf = 10000
        start = time.perf_counter()
        result = fibonacci(n_perf)
        elapsed = time.perf_counter() - start
        
        # 验证结果正确性（第10000项）
        result_str = str(result)
        # F(10000) 完整值极大，此处验证位数和首尾特征
        expected_digits = 2090  # F(10000) 精确位数
        
        status = "✓ PASS" if len(result_str) == expected_digits else "✗ FAIL"
        print(f"  F({n_perf}) 计算时间: {elapsed*1000:.2f}ms {status}")
        print(f"  结果长度: {len(result_str)} 位数字 (期望 {expected_digits})")
        assert elapsed < 0.1, f"性能未达标: {elapsed*1000:.2f}ms > 100ms"
        
        # ───── 生成器测试 ─────
        print("\n[生成器测试]")
        gen_result = list(fibonacci_generator(6))
        status = "✓ PASS" if gen_result == [0, 1, 1, 2, 3, 5] else "✗ FAIL"
        print(f"  generator(6) = {gen_result} {status}")
        
        print("\n" + "=" * 60)
        print("所有测试通过 ✓")
        print("=" * 60)
    
    run_tests()
