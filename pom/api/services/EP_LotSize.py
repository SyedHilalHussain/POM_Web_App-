import numpy as np
import matplotlib.pyplot as plt
import io
import base64

def parse_holding_cost(H_input, unit_cost):
    try:
        if "%" in H_input:
            percent = float(H_input.strip("%"))
            return (percent / 100) * unit_cost
        else:
            return float(H_input)
    except:
        raise ValueError("Invalid holding cost format. Use a number or percentage.")

def validate_inputs(D, S, p, d, days_per_year, H_raw, unit_cost, order_quantity):
    errors = []
    if days_per_year == 0 and d == 0:
        errors.append("The daily demand rate must be strictly positive. Enter a value for either days per year or daily rate.")
    if D <= 0:
        errors.append("The demand must be positive.")
    if S < 0:
        errors.append("Setup cost (S) cannot be negative.")
    if d < 0:
        errors.append("Daily demand rate (d) must be positive.")
    if p <= d:
        errors.append("Daily production rate (p) must be greater than the daily demand rate (d).")
    if order_quantity < 0:
        errors.append("Order quantity must be zero or positive.")
    if d > 0 and days_per_year > 0:
        D_computed = d * days_per_year
        if not np.isclose(D_computed, D, rtol=1e-5):
            errors.append("Something is inconsistent in data. The daily demand rate multiplied by the days per year does not equal the annual demand rate. You probably want to set either the days per year to 0 or the daily demand rate to zero.")
    try:
        if isinstance(H_raw, str) and "%" in H_raw:
            percent = float(H_raw.strip("%"))
            if percent <= 0:
                errors.append("Holding cost must be positive.")
            if unit_cost == 0:
                errors.append("The holding cost is the percent of the price but the price is zero")
        else:
            H_value = float(H_raw)
            if H_value <= 0:
                errors.append("Holding cost must be greater than 0.")
    except:
        errors.append("Invalid holding cost format. Use a number or percentage.")
    return errors

def epls_model(D, S, H, p, d, unit_cost):
    epq = np.sqrt((2 * D * S / H) * (p / (p - d)))
    max_inventory = epq * (p - d) / p
    avg_inventory = max_inventory / 2
    runs_per_year = D / epq
    setup_cost = runs_per_year * S
    holding_cost = avg_inventory * H
    total_inv_cost = setup_cost + holding_cost
    unit_cost_total = D * unit_cost
    grand_total = total_inv_cost + unit_cost_total

    return {
        'epq': round(epq, 2),
        'max_inventory': round(max_inventory, 2),
        'average_inventory': round(avg_inventory, 2),
        'production_runs_per_year': round(runs_per_year, 2),
        'annual_setup_cost': round(setup_cost, 2),
        'annual_holding_cost': round(holding_cost, 2),
        'total_inventory_cost': round(total_inv_cost, 2),
        'unit_costs_pd': round(unit_cost_total, 2),
        'total_cost_including_units': round(grand_total, 2)
    }

def compute_custom_order_quantity(D, S, H, p, d, unit_cost, order_quantity):
    max_inventory = order_quantity * (p - d) / p
    avg_inventory = max_inventory / 2
    runs_per_year = D / order_quantity
    setup_cost = runs_per_year * S
    holding_cost = avg_inventory * H
    total_inv_cost = setup_cost + holding_cost
    unit_cost_total = D * unit_cost
    grand_total = total_inv_cost + unit_cost_total

    return {
        'custom_max_inventory': round(max_inventory, 2),
        'custom_average_inventory': round(avg_inventory, 2),
        'custom_production_runs_per_year': round(runs_per_year, 2),
        'custom_annual_setup_cost': round(setup_cost, 2),
        'custom_annual_holding_cost': round(holding_cost, 2),
        'custom_total_inventory_cost': round(total_inv_cost, 2),
        'custom_total_cost_including_units': round(grand_total, 2)
    }

def generate_cost_chart(D, S, H, p, d):
    quantities = np.arange(100, 5000, 10)
    total_costs = []

    for q in quantities:
        max_inventory = q * (p - d) / p
        avg_inventory = max_inventory / 2
        setup_cost = (D / q) * S
        holding_cost = avg_inventory * H
        total_costs.append(setup_cost + holding_cost)

    optimal_q = np.sqrt((2 * D * S / H) * (p / (p - d)))
    optimal_total = min(total_costs)

    plt.figure(figsize=(10, 6))
    plt.plot(quantities, total_costs, label='Total Cost', color='blue')
    plt.axvline(optimal_q, color='gray', linestyle='--')
    plt.axhline(optimal_total, color='gray', linestyle='--')
    plt.title('EPLS Cost Curve')
    plt.xlabel('Production Quantity (Q)')
    plt.ylabel('Cost')
    plt.legend()
    plt.grid(True)

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    chart_url = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{chart_url}"

def process_epls_input(input_data):
    D = float(input_data['D'])
    S = float(input_data['S'])
    unit_cost = float(input_data['unit_cost'])
    H_raw = input_data['H']
    p = float(input_data['p'])
    d_input = float(input_data.get('d', 0))
    days_per_year_input = float(input_data.get('days_per_year', 0))
    order_quantity = float(input_data.get('order_quantity', 0))

    d_user_given = d_input > 0
    days_per_year_user_given = days_per_year_input > 0
    H_is_percent = isinstance(H_raw, str) and "%" in H_raw

    # ✅ Use raw values for validation first
    errors = validate_inputs(D, S, p, d_input, days_per_year_input, H_raw, unit_cost, order_quantity)
    if errors:
        return None, errors

    # ✅ Now it's safe to compute derived values
    if days_per_year_user_given:
        d = D / days_per_year_input
        days_per_year = days_per_year_input
    else:
        d = d_input
        days_per_year = D / d_input

    H = parse_holding_cost(H_raw, unit_cost)
    output_data = epls_model(D, S, H, p, d, unit_cost)

    if order_quantity > 0:
        custom_data = compute_custom_order_quantity(D, S, H, p, d, unit_cost, order_quantity)
        output_data.update(custom_data)

    chart_url = generate_cost_chart(D, S, H, p, d)

    if H_is_percent:
        output_data.update({'H': round(H, 2)})

    if days_per_year_user_given and not d_user_given:
        output_data.update({'d': round(d, 2)})
    elif d_user_given and not days_per_year_user_given:
        output_data.update({'days_per_year': round(days_per_year, 2)})

    return {
        'input_values': {
            'D': D, 'S': S, 'H': H, 'p': p, 'd': d, 'unit_cost': unit_cost
        },
        'output_data': output_data,
        'chart_url': chart_url
    }, None
