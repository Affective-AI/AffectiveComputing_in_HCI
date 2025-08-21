#!/usr/bin/env python3
"""
create_user.py — 用 Python 直接调用 Kairos 后端注册接口创建用户。
默认把 name=username，满足你“只输入 username+password”的需求。

用法示例：
  python create_user.py --username alice --password "Password123"
  python create_user.py -u 张三 -p "你的强密码"
  API_BASE 环境变量或 --api 指向后端：默认 http://localhost:8000/api
"""

import argparse
import getpass
import os
import sys
import requests

def main():
    parser = argparse.ArgumentParser(description="Create a user on Kairos backend via API")
    parser.add_argument("-u", "--username", help="用户名（可中文或英文）")
    parser.add_argument("-p", "--password", help="密码（至少8位）")
    parser.add_argument("--api", default=os.getenv("API_BASE", "http://localhost:8000/api"),
                        help="后端 API 基础地址，默认 http://localhost:8000/api")
    parser.add_argument("--login", action="store_true", help="创建后测试登录一次")
    args = parser.parse_args()

    username = args.username or input("username: ").strip()
    if not username:
        print("用户名不能为空", file=sys.stderr)
        sys.exit(1)

    password = args.password or getpass.getpass("password: ")
    if not password or len(password) < 8:
        print("密码至少 8 位", file=sys.stderr)
        sys.exit(1)

    api = args.api.rstrip("/")
    s = requests.Session()

    # 注册：name 用 username 填充即可
    reg_payload = {"username": username, "name": username, "password": password}
    try:
        r = s.post(f"{api}/auth/register", json=reg_payload, timeout=10)
    except requests.RequestException as e:
        print(f"[网络错误] {e}", file=sys.stderr)
        sys.exit(2)

    if r.status_code == 201:
        data = r.json()
        print(f"✅ 注册成功：id={data.get('id')} username={data.get('username')} name={data.get('name')}")
    elif r.status_code == 400 and "already" in (r.text or "").lower():
        print("ℹ️ 该用户名已存在（跳过注册）")
    else:
        try:
            detail = r.json().get("detail")
        except Exception:
            detail = r.text
        print(f"❌ 注册失败：HTTP {r.status_code} {detail}", file=sys.stderr)
        sys.exit(3)

    if args.login:
        try:
            lr = s.post(f"{api}/auth/login", json={"username": username, "password": password}, timeout=10)
            if lr.ok:
                me = s.get(f"{api}/auth/me", timeout=10)
                if me.ok:
                    print(f"🔐 登录成功，当前用户：{me.json()}")
                else:
                    print(f"登录成功，但拉取 /auth/me 失败：HTTP {me.status_code} {me.text}")
            else:
                print(f"❌ 登录失败：HTTP {lr.status_code} {lr.text}", file=sys.stderr)
                sys.exit(4)
        except requests.RequestException as e:
            print(f"[网络错误] {e}", file=sys.stderr)
            sys.exit(2)

if __name__ == "__main__":
    main()
