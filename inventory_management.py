def create_data_set():
    print("\n--- Create Data Set for Inventory Management ---")
    title = input("Enter the title for the data set: ")
    
    # Configure row names
    print("\nSelect row naming convention:")
    print("1. Range 1, Range 2, Range 3, ...")
    print("2. a, b, c, d, e, ...")
    print("3. A, B, C, D, E, ...")
    print("4. 1, 2, 3, 4, 5, ...")
    print("5. January, February, March, ...")
    print("6. Other")
    row_name_option = int(input("Enter your choice (1-6): "))
    
    if row_name_option == 5:
        start_month = input("Enter the start month: ")
    elif row_name_option == 6:
        other_row_name = input("Enter your custom row naming convention: ")
    
    print("\nData Set created successfully!\n")
    return title


def manage_inventory():
    print("\n--- Inventory Management ---")
    parameters = {
        "Reorder point w/o safety stock": 0,
        "Carrying cost per year": 0,
        "Stockout cost per unit": 0,
        "Orders per year": 1
    }
    
    probabilities = {}
    
    # Input inventory parameters
    print("Enter Inventory Parameters:")
    for param in parameters:
        parameters[param] = float(input(f"{param}: "))
    
    # Input probability distribution
    num_probabilities = int(input("\nEnter the number of values for probability distribution: "))
    print("\nEnter Probability Distribution:")
    for i in range(1, num_probabilities + 1):
        value = float(input(f"Demand value {i}: "))
        probability = float(input(f"Probability for demand value {i}: "))
        probabilities[value] = probability
    
    print("\nInventory data updated successfully!\n")
    return parameters, probabilities


def calculate_safety_stock_and_reorder_point(parameters, probabilities):
    print("\n--- Calculating Safety Stock and Reorder Point ---")
    reorder_point_without_safety_stock = parameters["Reorder point w/o safety stock"]
    carrying_cost = parameters["Carrying cost per year"]
    stockout_cost = parameters["Stockout cost per unit"]
    orders_per_year = parameters["Orders per year"]

    # Compute cumulative probabilities
    sorted_demands = sorted(probabilities.keys())
    cumulative_probabilities = {}
    cumulative_probability = 0

    for demand in sorted_demands:
        cumulative_probability += probabilities[demand]
        cumulative_probabilities[demand] = cumulative_probability

    # Determine safety stock
    safety_stock = 0
    min_cost = float('inf')
    best_safety_stock = 0

    for demand in sorted_demands:
        stockout_probability = 1 - cumulative_probabilities[demand]
        additional_holding_cost = carrying_cost * demand / orders_per_year
        stockout_risk_cost = stockout_probability * stockout_cost
        total_cost = additional_holding_cost + stockout_risk_cost

        if total_cost < min_cost:
            min_cost = total_cost
            best_safety_stock = demand

    safety_stock = best_safety_stock
    revised_reorder_point = reorder_point_without_safety_stock + safety_stock

    print(f"Best Safety Stock: {safety_stock}")
    print(f"Revised Reorder Point: {revised_reorder_point}")
    print(f"Minimal Cost: {min_cost:.2f}\n")

    return safety_stock, revised_reorder_point, min_cost


def display_data(title, parameters, probabilities, safety_stock, reorder_point, min_cost):
    print("\n--- Inventory Data Overview ---")
    print(f"Title: {title}")
    print("\nParameters:")
    for key, value in parameters.items():
        print(f"{key}: {value}")
    
    print("\nProbability Distribution:")
    for value, probability in probabilities.items():
        print(f"Demand Value: {value}, Probability: {probability}")

    print("\nCalculated Results:")
    print(f"Best Safety Stock: {safety_stock}")
    print(f"Revised Reorder Point: {reorder_point}")
    print(f"Minimal Cost: {min_cost:.2f}")
    print("\n")


# Main Program
def main():
    title = create_data_set()
    parameters, probabilities = manage_inventory()
    safety_stock, revised_reorder_point, min_cost = calculate_safety_stock_and_reorder_point(parameters, probabilities)
    display_data(title, parameters, probabilities, safety_stock, revised_reorder_point, min_cost)


if __name__ == "__main__":
    main()
