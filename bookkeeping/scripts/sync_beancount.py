#!/usr/bin/env python3
"""Regenerate Beancount file from SQLite (full sync)."""

import sqlite3
import argparse

HEADER = """; Oliver's Beancount Ledger
; 由 Allen 建立於 2026-02-05
; 由 SQLite 自動生成，請勿手動編輯交易區

option "title" "Oliver 的帳本"
option "operating_currency" "TWD"

; ============ 帳戶定義 ============

; 資產
2026-02-01 open Assets:Cash              TWD
2026-02-01 open Assets:Bank:Checking     TWD
2026-02-01 open Assets:Bank:Savings      TWD

; 負債
2026-02-01 open Liabilities:CreditCard   TWD

; 收入
2026-02-01 open Income:Salary            TWD
2026-02-01 open Income:Bonus             TWD
2026-02-01 open Income:Other             TWD

; 支出
2026-02-01 open Expenses:Food:Breakfast  TWD
2026-02-01 open Expenses:Food:Lunch      TWD
2026-02-01 open Expenses:Food:Dinner     TWD
2026-02-01 open Expenses:Food:Groceries  TWD
2026-02-01 open Expenses:Food:Drinks     TWD
2026-02-01 open Expenses:Food:Snacks     TWD
2026-02-01 open Expenses:Transport:Gas   TWD
2026-02-01 open Expenses:Transport:MRT   TWD
2026-02-01 open Expenses:Transport:Taxi  TWD
2026-02-01 open Expenses:Transport:Parking TWD
2026-02-01 open Expenses:Living:Daily    TWD
2026-02-01 open Expenses:Living:Rent     TWD
2026-02-01 open Expenses:Living:Utilities TWD
2026-02-01 open Expenses:Living:Phone    TWD
2026-02-01 open Expenses:Living:Subscription TWD
2026-02-01 open Expenses:Health:Medical  TWD
2026-02-01 open Expenses:Shopping:Clothing TWD
2026-02-01 open Expenses:Entertainment:Fun TWD
2026-02-01 open Expenses:Entertainment:Games TWD
2026-02-01 open Expenses:Education:Books TWD
2026-02-01 open Expenses:Social:Gifts    TWD
2026-02-01 open Expenses:Social:Dining   TWD

; ============ 交易記錄 ============
"""

def main():
    parser = argparse.ArgumentParser(description="Sync SQLite → Beancount")
    parser.add_argument("--db", required=True)
    parser.add_argument("--beancount", required=True)
    args = parser.parse_args()

    conn = sqlite3.connect(args.db)
    cur = conn.cursor()
    cur.execute("SELECT date, payee, narration, account, amount, currency, payment FROM transactions ORDER BY date, id")
    rows = cur.fetchall()
    conn.close()

    lines = [HEADER]
    for date, payee, narration, account, amount, currency, payment in rows:
        lines.append(f'{date} * "{payee}" "{narration}"')
        lines.append(f'  {account}    {int(amount) if amount == int(amount) else amount} {currency}')
        lines.append(f'  {payment}')
        lines.append("")

    with open(args.beancount, "w") as f:
        f.write("\n".join(lines))

    print(f"[OK] Synced {len(rows)} transactions to {args.beancount}")

if __name__ == "__main__":
    main()
