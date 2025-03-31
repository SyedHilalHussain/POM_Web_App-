def create_dataset_console():
    print("Create Data Set for Decision Making")
    print("----------------------------------")

    # Title Input
    title = input("Enter the title: ")

    # Number of Options
    while True:
        try:
            num_options = int(input("Enter the number of options (minimum 2): "))
            if num_options >= 2:
                break
            else:
                print("Please enter a number greater than or equal to 2.")
        except ValueError:
            print("Invalid input. Please enter a valid number.")

    # Number of Scenarios
    while True:
        try:
            num_scenarios = int(input("Enter the number of scenarios (minimum 2): "))
            if num_scenarios >= 2:
                break
            else:
                print("Please enter a number greater than or equal to 2.")
        except ValueError:
            print("Invalid input. Please enter a valid number.")

    # Objective Selection
    print("Objective:")
    print("1. Profits (maximize)")
    print("2. Costs (minimize)")
    while True:
        objective_choice = input("Select objective (1 or 2): ")
        if objective_choice in ["1", "2"]:
            objective = "Profits (maximize)" if objective_choice == "1" else "Costs (minimize)"
            break
        else:
            print("Invalid choice. Please select 1 or 2.")

    # Row Names Selection
    print("Row Names:")
    row_names_options = [
        "Option 1, Option 2, Option 3...",
        "a, b, c, d...",
        "A, B, C, D...",
        "1, 2, 3, 4...",
        "January, February, March...",
        "Other"
    ]
    for i, option in enumerate(row_names_options, start=1):
        print(f"{i}. {option}")
    while True:
        try:
            row_names_choice = int(input("Select row names style (1-6): "))
            if 1 <= row_names_choice <= 6:
                row_names = row_names_options[row_names_choice - 1]
                break
            else:
                print("Please select a number between 1 and 6.")
        except ValueError:
            print("Invalid input. Please enter a number between 1 and 6.")

    # Output the selected parameters
    print("\nDataset Parameters:")
    print(f"Title: {title}")
    print(f"Number of Options: {num_options}")
    print(f"Number of Scenarios: {num_scenarios}")
    print(f"Objective: {objective}")
    print(f"Row Names Style: {row_names}")
    return num_scenarios, num_options, objective


def decision_analysis(num_scenarios, num_options, objective):
    print("\nDecision Analysis Module")
    print("-------------------------")

    # Input Probabilities
    probabilities = []
    print("Enter the probabilities for each scenario (they must sum to 1):")
    for i in range(num_scenarios):
        while True:
            try:
                prob = float(input(f"Probability for Scenario {i + 1}: "))
                probabilities.append(prob)
                break
            except ValueError:
                print("Invalid input. Please enter a number.")

    if abs(sum(probabilities) - 1.0) > 0.01:
        print("Probabilities do not sum to 1. Please restart and try again.")
        return

    # Input Payoff Values
    payoffs = []
    print("Enter the payoff values for each option under each scenario:")
    for i in range(num_options):
        option_payoffs = []
        print(f"Option {i + 1}:")
        for j in range(num_scenarios):
            while True:
                try:
                    value = float(input(f"Payoff for Scenario {j + 1}: "))
                    option_payoffs.append(value)
                    break
                except ValueError:
                    print("Invalid input. Please enter a number.")
        payoffs.append(option_payoffs)

    # Calculations
    expected_values = []
    for option in payoffs:
        ev = sum(p * v for p, v in zip(probabilities, option))
        expected_values.append(ev)

    maximin_values = [min(option) for option in payoffs]
    maximax_values = [max(option) for option in payoffs]

    if objective == "Profits (maximize)":
        best_ev = max(expected_values)
        best_option_ev = expected_values.index(best_ev) + 1

        best_maximin = max(maximin_values)
        best_option_maximin = maximin_values.index(best_maximin) + 1

        best_maximax = max(maximax_values)
        best_option_maximax = maximax_values.index(best_maximax) + 1
    else:
        best_ev = min(expected_values)
        best_option_ev = expected_values.index(best_ev) + 1

        best_maximin = min(maximin_values)
        best_option_maximin = maximin_values.index(best_maximin) + 1

        best_maximax = min(maximax_values)
        best_option_maximax = maximax_values.index(best_maximax) + 1

    # Regret Table
    regret_table = []
    for scenario_idx in range(num_scenarios):
        if objective == "Profits (maximize)":
            best_scenario_value = max([payoffs[option_idx][scenario_idx] for option_idx in range(num_options)])
        else:
            best_scenario_value = min([payoffs[option_idx][scenario_idx] for option_idx in range(num_options)])

        regrets = [abs(best_scenario_value - payoffs[option_idx][scenario_idx]) for option_idx in range(num_options)]
        regret_table.append(regrets)

    # Display Results
    print("\nResults:")
    print("Expected Values (EV):")
    for i, ev in enumerate(expected_values):
        print(f"Option {i + 1}: {ev:.2f}")
    print(f"Best EV: Option {best_option_ev} (Value: {best_ev:.2f})")

    print("\nMaximin Values:")
    for i, mm in enumerate(maximin_values):
        print(f"Option {i + 1}: {mm:.2f}")
    print(f"Best Maximin: Option {best_option_maximin} (Value: {best_maximin:.2f})")

    print("\nMaximax Values:")
    for i, mx in enumerate(maximax_values):
        print(f"Option {i + 1}: {mx:.2f}")
    print(f"Best Maximax: Option {best_option_maximax} (Value: {best_maximax:.2f})")

    print("\nRegret Table:")
    for i, regrets in enumerate(regret_table):
        print(f"Scenario {i + 1}: {', '.join(f'{regret:.2f}' for regret in regrets)}")


# Main Flow
num_scenarios, num_options, objective = create_dataset_console()
decision_analysis(num_scenarios, num_options, objective)

