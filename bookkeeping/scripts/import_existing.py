#!/usr/bin/env python3
"""Import existing beancount transactions into SQLite (one-time migration)."""

import sqlite3
import re
import argparse
from datetime import datetime, timezone, timedelta

TZ = timezone(timedelta(hours=8))

def parse_beancount(path):
    """Parse transaction entries from beancount file."""
    txns = []
    with open(path) as f:
        lines = f.readlines()
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Match: 2026-02-04 * "payee" "narration"
        m = re.match(r'^(\d{4}-\d{2}-\d{2})\s+\*\s+"([^"]+)"\s+"([^"]+)"', line)
        if m:
            date, payee, narration = m.groups()
            # Skip opening balances
            if payee == "開帳":
                i += 1
                continue
            # Next line is the expense/income account
            i += 1
            if i < len(lines):
                acct_line = lines[i].strip()
                am = re.match(r'^(\S+)\s+([\d.]+)\s+(\w+)', acct_line)
                if am:
                    account = am.group(1)
                    amount = float(am.group(2))
                    currency = am.group(3)
                    # Next line is payment
                    i += 1
                    payment = "Assets:Cash"
                    if i < len(lines):
                        pay_line = lines[i].strip()
                        if pay_line and not pay_line.startswith(";") and not re.match(r'^\d{4}', pay_line):
                            payment = pay_line.split()[0] if pay_line.split() else "Assets:Cash"
                    
                    txns.append({
                        "date": date,
                        "payee": payee,
                        "narration": narration,
                        "account": account,
                        "amount": amount,
                        "currency": currency,
                        "payment": payment,
                    })
                    i += 1
                    continue
        i += 1
    return txns

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True)
    parser.add_argument("--beancount", required=True)
    args = parser.parse_args()

    txns = parse_beancount(args.beancount)
    ts = datetime.now(TZ).isoformat()

    conn = sqlite3.connect(args.db)
    cur = conn.cursor()

    for t in txns:
        # Each legacy entry gets its own message (no original text available)
        msg_text = f'[匯入] {t["date"]} {t["payee"]} {t["narration"]} {int(t["amount"])}'
        cur.execute(
            "INSERT INTO messages (text, sender_id, created_at) VALUES (?, ?, ?)",
            (msg_text, "import", ts)
        )
        msg_id = cur.lastrowid
        cur.execute(
            """INSERT INTO transactions 
               (message_id, date, payee, narration, account, amount, currency, payment, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (msg_id, t["date"], t["payee"], t["narration"], t["account"],
             t["amount"], t.get("currency", "TWD"), t.get("payment", "Assets:Cash"), ts)
        )

    conn.commit()
    conn.close()
    print(f"[OK] Imported {len(txns)} transactions")

if __name__ == "__main__":
    main()
