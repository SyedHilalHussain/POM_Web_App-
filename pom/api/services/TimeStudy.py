import pandas as pd
import numpy as np

def process_time_study_input(input_data):
    try:
        num_elements = int(input_data['num_elements'])
        num_observations = int(input_data['num_observations'])
        allowance_percent = float(input_data['allowance_percent'])
        data = input_data['data']

        row_names = input_data.get('row_names', [f"Element {i+1}" for i in range(num_elements)])
        column_names = input_data.get('column_names', [f"Obs {j+1}" for j in range(num_observations)])

        if len(data) != num_elements:
            return None, "Number of elements does not match the provided data."

        if len(row_names) != num_elements:
            return None, "Number of row names must match number of elements."

        if len(column_names) != num_observations:
            return None, "Number of column names must match number of observations."


        # Validate each element
        averages = []
        std_devs = []
        normal_times = []
        perform_rates = []

        for i, element in enumerate(data):
            observations = element.get('observations')
            performance_rate = element.get('performance_rate', 1)

            if performance_rate <= 0:
                return None, "Performance rate must be greater than zero."

            if not isinstance(observations, list) or len(observations) != num_observations:
                return None, f"Element {i+1} must have exactly {num_observations} observations."

            # Validate numbers
            try:
                observations = [float(x) for x in observations]
                performance_rate = float(performance_rate)
            except (ValueError, TypeError):
                return None, f"All observations and performance rate must be numbers in element {i+1}."

            avg = np.mean(observations)
            std = np.std(observations, ddof=1)
            norm = (avg * (performance_rate / 100)) * 100

            averages.append(avg)
            std_devs.append(round(std, 2))
            normal_times.append(round(norm, 2))
            perform_rates.append(performance_rate)

        total_normal = round(sum(normal_times), 2)
        standard_time = round(total_normal * (1 + allowance_percent / 100), 2)

        # Build table
        table_data = {
            "Element": row_names,
            "Average": averages,
            "Sample Std Dev": std_devs,
            "Normal": normal_times,
            "Perform Rate %": perform_rates,
        }

        for j in range(num_observations):
            col_name = column_names[j]
            table_data[col_name] = [e['observations'][j] for e in data]

        df = pd.DataFrame(table_data)
        df.loc[len(df)] = ["Normal proc time", "", "", total_normal, "", *[""] * num_observations]
        df.loc[len(df)] = ["Standard time", "", "", standard_time, "", *[""] * num_observations]
        df.set_index("Element", inplace=True)

        return {
            "output_data": {
                "table": df.fillna("").to_dict()
            }
        }, None

    except Exception as e:
        return None, str(e)
