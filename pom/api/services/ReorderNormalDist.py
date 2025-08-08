# reorder_normal_dist/services/ReorderNormalDist.py

import numpy as np
from scipy.stats import norm

def get_z_value(service_level, daily_std_dev, lead_time_std_dev):
    if service_level >= 100:
        return 0
    elif service_level < 50:
        return -0.01

    if 99.89 <= service_level <= 99.91 and daily_std_dev > 0 and lead_time_std_dev > 0:
        return 3.102
    elif 99.89 <= service_level <= 99.91:
        return 3.09
    elif 99.98 <= service_level <= 99.999:
        return 3.63
    else:
        p = service_level / 100
        return round(norm.ppf(p), 2)

def calculate_reorder_point(daily_demand, daily_std_dev, service_level, lead_time, lead_time_std_dev):
    # Validation
    if lead_time <= 0:
        raise ValueError("Lead time must be > 0.")
    if daily_demand < 0 or daily_std_dev < 0 or lead_time_std_dev < 0:
        raise ValueError("Inputs cannot be negative.")

    z = get_z_value(service_level, daily_std_dev, lead_time_std_dev)
    expected_demand = daily_demand * lead_time

    term1 = lead_time * (daily_std_dev ** 2)
    term2 = (daily_demand ** 2) * (lead_time_std_dev ** 2)
    std_dev_dlt = np.sqrt(term1 + term2)

    safety_stock = round(z * std_dev_dlt, 2)
    reorder_point = round(expected_demand + safety_stock, 2)

    return {
        "Z value": z,
        "Expected demand during lead time": expected_demand,
        "Safety Stock": safety_stock,
        "Reorder point": reorder_point
    }

def process_reorder_normal_dist_input(input_data):
    try:
        daily_demand = float(input_data['daily_demand'])
        daily_std_dev = float(input_data['daily_std_dev'])
        service_level = float(input_data['service_level'])
        lead_time = float(input_data['lead_time'])
        lead_time_std_dev = float(input_data['lead_time_std_dev'])

        results = calculate_reorder_point(
            daily_demand, daily_std_dev, service_level, lead_time, lead_time_std_dev
        )

        return {
            "output_data": results
        }, None

    except Exception as e:
        return None, str(e)
