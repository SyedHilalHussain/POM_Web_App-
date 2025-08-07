import numpy as np
import math

confidence_options = {
    "1 sigma (68.27%)": {"z": 1.00},
    "2 sigma (95.45%)": {"z": 2.00},
    "3 sigma (99.73%)": {"z": 3.00},
    "4 sigma (9999.37%)": {"z": 4.00},
    "90% (1.65 sigma)": {"z": 1.65},
    "95% (1.96 sigma)": {"z": 1.96},
    "98% (2.33 sigma)": {"z": 2.33},
    "99% (2.58 sigma)": {"z": 2.58},
}


def calculate_mean_std_dev(data):
    mean = np.mean(data)
    std_dev = np.std(data, ddof=1)
    return mean, std_dev

def calculate_sample_size(mean, std_dev, accuracy_percent, z_score):
    try:
        margin_of_error = accuracy_percent * mean  # don't divide by 100
        if margin_of_error == 0:
            return None, "Margin of error calculated as zero. Adjust accuracy or mean."
        n = (z_score * std_dev / margin_of_error) ** 2
        return max(1, math.ceil(n)), None
    except ZeroDivisionError:
        return None, "Division by zero occurred during sample size calculation."

def process_sample_size_input(input_data):
    try:
        num_elements = int(input_data["num_elements"])
        method = input_data["objective"]
        confidence_key = input_data["confidence_level"]
        elements = input_data["elements"]

        if confidence_key not in confidence_options:
            return None, "Invalid confidence level option."

        z_score = confidence_options[confidence_key]["z"]

        row_names = input_data.get("row_names") or [f"Element {i+1}" for i in range(num_elements)]

        # If method is raw data, get sample_size and generate default column names
        if method == "Raw data":
            sample_size = int(input_data.get("sample_size", len(elements[0].get("raw_data", []))))
            column_names = input_data.get("column_names") or [f"Obs {i+1}" for i in range(sample_size)]
       
        if len(elements) != num_elements:
            return None, "Number of elements does not match provided data."

        results = []

        for i, elem in enumerate(elements, start=1):
            try:
                accuracy = float(elem["accuracy"])
                if accuracy <= 0:
                    return None, f"The accuracy level must be strictly positive"

                if method == "Mean, Standard deviation":
                    mean = float(elem["mean"])
                    std_dev = float(elem["std_dev"])
                    if mean <= 0 or std_dev <= 0:
                        return None, f"Mean and standard deviation must be positive for element {i}"

                elif method == "Raw data":
                    raw_data = list(map(float, elem["raw_data"]))
                    if len(raw_data) < 2:
                        return None, f"Element {i} must have at least 2 raw observations"
                    
                    # Validate sample_size consistency
                    if "sample_size" in input_data:
                        declared_size = int(input_data["sample_size"])
                        if declared_size != len(raw_data):
                            return None, f"Element {i}: sample_size ({declared_size}) does not match number of raw_data entries ({len(raw_data)})"
                    else:
                        declared_size = len(raw_data)
    
                    mean, std_dev = calculate_mean_std_dev(raw_data)

                else:
                    return None, "Invalid method selected."

                sample_size, calc_error = calculate_sample_size(mean, std_dev, accuracy, z_score)
                if calc_error:
                    return None, calc_error

                results.append({
                    "element": i,
                    "Sample average": round(mean, 2),
                    "Sample Std dev": round(std_dev, 2),
                    "Accuracy level": accuracy,
                    "Sample size": sample_size
                })

            except Exception as e:
                return None, f"Error in element {i}: {str(e)}"

        return {
            "output_data": results
        }, None

    except Exception as e:
        return None, str(e)
