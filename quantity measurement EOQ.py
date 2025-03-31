import math
import matplotlib.pyplot as plt


# Function to calculate EOQ
def calculate_eoq(demand_rate, ordering_cost, holding_cost):
    return math.sqrt((2 * demand_rate * ordering_cost) / holding_cost)


# Function to calculate various costs and inventory metrics
def calculate_costs_and_metrics(demand_rate, ordering_cost, holding_cost, eoq, price_per_unit):
    # Calculate the number of orders per period (N)
    orders_per_period = demand_rate / eoq

    # Annual setup cost
    annual_setup_cost = orders_per_period * ordering_cost

    # Annual holding cost (EOQ / 2 * holding cost per unit)
    average_inventory = eoq / 2
    annual_holding_cost = average_inventory * holding_cost

    # Unit costs (PD) (total purchase cost)
    unit_costs = demand_rate * price_per_unit

    # Maximum inventory level
    max_inventory_level = eoq

    # Total cost (including purchases)
    total_cost = annual_setup_cost + annual_holding_cost + unit_costs

    return {
        'EOQ': eoq,
        'Max Inventory Level': max_inventory_level,
        'Average Inventory': average_inventory,
        'Orders per Period (N)': orders_per_period,
        'Annual Setup Cost': annual_setup_cost,
        'Annual Holding Cost': annual_holding_cost,
        'Unit Costs (PD)': unit_costs,
        'Total Cost': total_cost
    }


# Main program to calculate costs for each price range and plot results
def main():
    # Input parameters from user
    demand_rate = int(input("Enter the demand rate (D): "))
    ordering_cost = float(input("Enter the setup/ordering cost (S): "))
    holding_cost = float(input("Enter the holding/carrying cost (H): "))

    # Ask user for the number of price ranges
    num_price_ranges = int(input("Enter the number of price ranges: "))
    price_ranges = []

    # Get price range details from user
    for i in range(num_price_ranges):
        print(f"Enter details for price range {i + 1}:")
        from_qty = int(input("  From quantity: "))
        to_qty = int(input("  To quantity: "))
        price_per_unit = float(input("  Price per unit: "))
        price_ranges.append((from_qty, to_qty, price_per_unit))

    # Variables to store results
    results = []
    total_costs = []  # For plotting
    ranges = []  # For x-axis labels in plot

    # Calculate EOQ and costs for each price range
    for from_qty, to_qty, price_per_unit in price_ranges:
        # Recalculate EOQ for each price range (price shouldn't affect EOQ, only the cost components)
        eoq = calculate_eoq(demand_rate, ordering_cost, holding_cost)
        metrics = calculate_costs_and_metrics(demand_rate, ordering_cost, holding_cost, eoq, price_per_unit)
        results.append((from_qty, to_qty, price_per_unit, metrics))

        # For plotting
        ranges.append(f"{from_qty}-{to_qty}")
        total_costs.append(metrics['Total Cost'])

        # Display results
        print(f"\n--- Results for price range {from_qty}-{to_qty} ---")
        for key, value in metrics.items():
            print(f"{key}: {value:.2f}")

    # Plotting the Total Cost across price ranges
    plt.figure(figsize=(10, 6))
    plt.plot(ranges, total_costs, marker='o', linestyle='-', color='b')
    plt.title('Total Cost for Different Price Ranges')
    plt.xlabel('Price Ranges')
    plt.ylabel('Total Cost')
    plt.grid(True)
    plt.show()


# Run the program
if __name__ == "__main__":
    main()