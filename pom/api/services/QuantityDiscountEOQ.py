import numpy as np
import matplotlib.pyplot as plt
import io, base64, math

def parse_holding_cost(raw_holding_cost):
    if isinstance(raw_holding_cost, str) and "%" in raw_holding_cost:
        holding_cost_pct = float(raw_holding_cost.strip("%"))
        return holding_cost_pct / 100
    else:
        return float(raw_holding_cost)

def validate_inputs(D, S, raw_holding_cost, num_ranges, ranges):
    if D <= 0:
        raise ValueError("Annual Demand (D) must be positive.")
    if S <= 0:
        raise ValueError("Ordering/ Setup Cost (S) must be positive.")
    if num_ranges < 2:
        raise ValueError("At least 2 price ranges must be entered.")
    if len(ranges) != num_ranges:
        raise ValueError(f"Expected {num_ranges} ranges, but got {len(ranges)}.")
    
    try:
        if isinstance(raw_holding_cost, str) and "%" in raw_holding_cost:
            holding_cost_pct = float(raw_holding_cost.strip("%"))
            if holding_cost_pct <= 0:
                raise ValueError("Holding cost must be positive")
        else:
            holding_cost = float(raw_holding_cost)
            if holding_cost <= 0:
                raise ValueError("Holding cost must be positive")
    except:
        raise ValueError("Invalid holding cost format. Use a number or percentage.")

    if all(r['price'] == 0 for r in ranges):
        raise ValueError("All prices are zero. Fix them")

    prev_upper = -1
    prev_price = float('inf')

    for r in ranges:
        try:
            lower = int(r['lower'])
            upper = int(r['upper'])
            price = float(r['price'])
        except ValueError:
            raise ValueError("Range values (lower, upper, price) must be numeric.")

        lower, upper, price = r['lower'], r['upper'], r['price']
        if lower < 0 or (upper != float('inf') and upper < lower):
            raise ValueError("Invalid quantity range (lower/upper).")
        if price < 0:
            raise ValueError("Unit price must be non-negative.")
        if lower <= prev_upper:
            raise ValueError("Price ranges are inconsistent: overlapping or out of order.")
        if price > prev_price:
            raise ValueError("The prices increase from one range to the next. Check price consistency.")
        prev_upper, prev_price = upper, price

    for i in range(1, len(ranges)):
        if ranges[i]['lower'] > ranges[i - 1]['upper'] + 1:
            raise ValueError("Price ranges are inconsistent: a gap exists between ranges.")


def calculate_eoq(demand_rate, setup_cost, holding_cost, ranges, is_holding_cost_pct):
    results = []

    for r in ranges:
        price = r['price']
        lower, upper = r['lower'], r['upper']

        NA_result = {
            'range': f"{int(lower)} - {'∞' if upper == float('inf') else int(upper)}",
            'q_star': None,
            'order_quantity': None,
            'setup_cost': None,
            'holding_cost': None,
            'unit_cost': None,
            'total_cost': None,
        }

        if price == 0:
            results.append(NA_result)
            continue
        
        if is_holding_cost_pct:
            q_star = math.sqrt((2 * demand_rate * setup_cost) / (holding_cost * price))
        else: 
            q_star = math.sqrt((2 * demand_rate * setup_cost) / holding_cost)

        if lower <= q_star <= upper:
            order_quantity = q_star
        elif q_star < lower:
            order_quantity = lower
        else:
            NA_result['q_star'] = q_star
            results.append(NA_result)
            continue

        total_setup_cost = (demand_rate / order_quantity) * setup_cost

        if is_holding_cost_pct:
            total_holding_cost = (order_quantity / 2) * holding_cost * price
        else:
            total_holding_cost = (order_quantity / 2) * holding_cost
        total_unit_cost = demand_rate * price
        total_cost = total_setup_cost + total_holding_cost + total_unit_cost

        results.append({
            'range': f"{int(lower)} - {'∞' if upper == float('inf') else int(upper)}",
            'q_star': round(q_star, 2),
            'order_quantity': round(order_quantity, 2),
            'total_setup_cost': round(total_setup_cost, 2),
            'total_holding_cost': round(total_holding_cost, 2),
            'total_unit_cost': round(total_unit_cost, 2),
            'total_cost': round(total_cost, 2),
        })

    valid = [r for r in results if r['total_cost'] is not None]
    best = min(valid, key=lambda x: x['total_cost'])
    return results, best


def generate_cost_chart(D, S, h_pct, ranges, best_Q):
    Q_vals = np.arange(1, int(best_Q * 2) + 1)
    costs = []

    for Q in Q_vals:
        P = None
        for r in ranges:
            if r['lower'] <= Q <= r['upper']:
                P = r['price']
                break
        if P is None:
            costs.append(np.nan)
            continue

        h = P * h_pct
        if h == 0:
            costs.append(np.nan)
            continue

        setup = (D / Q) * S
        holding = (Q / 2) * h
        purchase = D * P
        total = setup + holding + purchase
        costs.append(total)

    plt.figure(figsize=(10, 6))
    plt.plot(Q_vals, costs, color='blue', lw=2, label="Total Cost Curve")
    best_cost = min([c for c in costs if not np.isnan(c)])
    plt.scatter(best_Q, best_cost, color='red', s=80, zorder=5, label=f"Optimal Q = {best_Q:.2f}")
    plt.title("EOQ with Quantity Discounts")
    plt.xlabel("Order Quantity (Q)")
    plt.ylabel("Total Annual Cost")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    chart_url = base64.b64encode(buf.getvalue()).decode("utf-8")
    plt.close()
    return f"data:image/png;base64,{chart_url}"


def process_qdeoq_input(input_data):
    try:
        num_ranges = int(input_data['num_ranges'])
        demand_rate = float(input_data['demand_rate'])
        setup_cost = float(input_data['setup_cost'])
        raw_holding_cost = input_data['holding_cost']
        ranges = input_data['ranges']

        is_holding_cost_pct = isinstance(raw_holding_cost, str) and "%" in raw_holding_cost

        validate_inputs(demand_rate, setup_cost, raw_holding_cost, num_ranges, ranges)

        holding_cost = parse_holding_cost(raw_holding_cost)

        results, best = calculate_eoq(demand_rate, setup_cost, holding_cost, ranges, is_holding_cost_pct)
        chart_url = generate_cost_chart(demand_rate, setup_cost, holding_cost, ranges, best['order_quantity'])

        output_data = {
            "result": {
                "optimal_order_quantity": round(best["order_quantity"], 2),
                "maximum_inventory": round(best["order_quantity"], 2),
                "average_inventory": round(best["order_quantity"] / 2),
                "orders_per_period": round(demand_rate / best["order_quantity"], 2),
                "annual_setup_cost": round(best["total_setup_cost"], 2),
                "annual_holding_cost": round(best["total_holding_cost"], 2),
                "unit_cost": round(best["total_unit_cost"], 2),
                "total_cost": round(best["total_cost"], 2),
            },
            "details": results
        }

        return {
            "input_data": input_data,
            "output_data": output_data,
            "chart_url": chart_url
        }, None
    except Exception as e:
        return None, str(e)
