import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def calculate_decision_table(options, profits, probabilities):
    """
    Calculates the expected profit for each option based on provided probabilities and profits.

    :param options: List of option names (maximum 10 options)
    :param profits: 2D list where each row represents the profits of an option under different scenarios.
    :param probabilities: List of probabilities for each scenario (maximum 10 scenarios)
    :return: DataFrame with the calculated expected profits for each option.
    """
    # Ensure valid input sizes
    if len(probabilities) > 10 or len(options) > 10 or any(len(profit) != len(probabilities) for profit in profits):
        raise ValueError(
            "You can have a maximum of 10 options and 10 scenarios. Profits should match the number of scenarios.")

    # Convert to numpy arrays for vectorized operations
    profits_array = np.array(profits)
    probabilities_array = np.array(probabilities)

    # Calculate the expected profit for each option
    expected_profits = np.dot(profits_array, probabilities_array)

    # Create a DataFrame for easy display
    decision_table = pd.DataFrame({
        'Option': options,
        'Expected Profit': expected_profits
    })

    # Sort by expected profit in descending order for better decision-making
    decision_table = decision_table.sort_values(by='Expected Profit', ascending=False).reset_index(drop=True)

    return decision_table


def plot_decision_table(decision_table):
    """
    Plots a bar chart of the expected profits for each option.

    :param decision_table: DataFrame containing options and their expected profits.
    """
    plt.figure(figsize=(10, 6))
    plt.bar(decision_table['Option'], decision_table['Expected Profit'])
    plt.title('Expected Profit for Each Option')
    plt.xlabel('Option')
    plt.ylabel('Expected Profit')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()


def get_user_input():
    """
    Collects the names of options, scenarios, profits, and probabilities from the user.
    """
    # Get the number of options and scenarios from the user
    num_options = int(input("Enter the number of options (max 10): "))
    num_scenarios = int(input("Enter the number of scenarios (max 10): "))

    if num_options > 10 or num_scenarios > 10:
        raise ValueError("The maximum number of options and scenarios is 10.")

    # Get the names of the options
    options = []
    for i in range(num_options):
        option_name = input(f"Enter name for Option {i + 1}: ")
        options.append(option_name)

    # Get the names of the scenarios
    scenarios = []
    for i in range(num_scenarios):
        scenario_name = input(f"Enter name for Scenario {i + 1}: ")
        scenarios.append(scenario_name)

    # Get the profit matrix for each option under each scenario
    profits = []
    for option in options:
        option_profits = []
        print(f"Enter the profits for {option} under each scenario:")
        for scenario in scenarios:
            profit = float(input(f"Profit under {scenario}: "))
            option_profits.append(profit)
        profits.append(option_profits)

    # Get the probabilities for each scenario
    probabilities = []
    print("Enter the probabilities for each scenario (they should sum up to 1):")
    for scenario in scenarios:
        probability = float(input(f"Probability for {scenario}: "))
        probabilities.append(probability)

    if not np.isclose(sum(probabilities), 1.0):
        raise ValueError("The probabilities should sum up to 1.")

    return options, profits, probabilities


# Main function to run the decision table calculation and plotting
def main():
    try:
        # Get user inputs
        options, profits, probabilities = get_user_input()

        # Calculate the decision table
        decision_table = calculate_decision_table(options, profits, probabilities)

        # Display the decision table
        print("\nDecision Table (Expected Profits for Each Option):")
        print(decision_table)

        # Plot the decision table
        plot_decision_table(decision_table)

    except ValueError as e:
        print(f"Error: {e}")

pc
# Run the main function
if __name__ == "_main_":
    main()