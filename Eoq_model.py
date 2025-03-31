import math
import matplotlib.pyplot as plt


# EOQ function for No Reorder Point
def eoq_no_reorder(D, S, H, unit_cost):
    EOQ = math.sqrt((2 * D * S) / H)
    max_inventory = EOQ
    avg_inventory = EOQ / 2
    orders_per_period = D / EOQ
    annual_setup_cost = (D / EOQ) * S
    annual_holding_cost = avg_inventory * H
    total_inventory_cost = annual_setup_cost + annual_holding_cost
    unit_cost_PD = D * unit_cost
    total_cost_including_units = total_inventory_cost + unit_cost_PD
    return EOQ, max_inventory, avg_inventory, orders_per_period, annual_setup_cost, annual_holding_cost, total_inventory_cost, unit_cost_PD, total_cost_including_units


# EOQ function for Compute Reorder Point
def eoq_with_reorder(D, S, H, unit_cost, days_per_year, lead_time, safety_stock):
    # Calculate daily demand rate
    daily_demand = D / days_per_year
    EOQ, max_inventory, avg_inventory, orders_per_period, annual_setup_cost, annual_holding_cost, total_inventory_cost, unit_cost_PD, total_cost_including_units = eoq_no_reorder(
        D, S, H, unit_cost)
    reorder_point = (daily_demand * lead_time) + safety_stock
    return EOQ, max_inventory, avg_inventory, orders_per_period, annual_setup_cost, annual_holding_cost, total_inventory_cost, reorder_point, unit_cost_PD, total_cost_including_units


# Function to display results and plot the data
def display_results(eoq_data, is_reorder_point=False):
    EOQ, max_inventory, avg_inventory, orders_per_period, annual_setup_cost, annual_holding_cost, total_inventory_cost, unit_cost_PD, total_cost_including_units = eoq_data[
                                                                                                                                                                   :9]

    print(f"Optimal Order Quantity (EOQ): {EOQ:.2f}")
    print(f"Maximum Inventory Level: {max_inventory:.2f}")
    print(f"Average Inventory: {avg_inventory:.2f}")
    print(f"Orders per Period: {orders_per_period:.2f}")
    print(f"Annual Setup Cost: {annual_setup_cost:.2f}")
    print(f"Annual Holding Cost: {annual_holding_cost:.2f}")
    print(f"Total Inventory Cost: {total_inventory_cost:.2f}")
    print(f"Unit Cost (PD): {unit_cost_PD:.2f}")
    print(f"Total Cost (Including Units): {total_cost_including_units:.2f}")

    if is_reorder_point:
        reorder_point = eoq_data[7]
        print(f"Reorder Point: {reorder_point:.2f}")

    # Plot the results
    fig, ax = plt.subplots()
    ax.bar(['EOQ', 'Max Inventory', 'Avg Inventory', 'Orders per Period'],
           [EOQ, max_inventory, avg_inventory, orders_per_period])
    ax.set_ylabel('Values')
    ax.set_title('EOQ Analysis')

    # Display the plot and automatically close after some time
    plt.show(block=False)
    plt.pause(3)  # Adjust the pause duration as per your need (in seconds)
    plt.close()


# Function to safely take a float input with validation
def get_float_input(prompt):
    while True:
        try:
            value = float(input(prompt))
            return value
        except ValueError:
            print("Invalid input. Please enter a numeric value.")


# Main function to take input from the user
def main():
    product_count = int(input("Enter the number of products to analyze: "))

    for i in range(product_count):
        print(f"\n--- Product {i + 1} ---")
        choice = input("Choose 1 for No Reorder Point or 2 for Compute Reorder Point: ")

        D = get_float_input("Enter Demand Rate (D): ")
        S = get_float_input("Enter Setup/Ordering Cost (S): ")
        H = get_float_input("Enter Holding/Carrying Cost (H): ")
        unit_cost = get_float_input("Enter Unit Cost: ")

        if choice == '1':
            eoq_data = eoq_no_reorder(D, S, H, unit_cost)
            display_results(eoq_data)

        elif choice == '2':
            days_per_year = int(input("Enter Days per Year: "))
            lead_time = int(input("Enter Lead Time (in days): "))
            safety_stock = get_float_input("Enter Safety Stock: ")
            eoq_data = eoq_with_reorder(D, S, H, unit_cost, days_per_year, lead_time, safety_stock)
            display_results(eoq_data, is_reorder_point=True)

        else:
            print("Invalid choice. Please try again.")


# Run the program
if __name__ == "__main__":
    main()