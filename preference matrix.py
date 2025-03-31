def preference_matrix():
    # Title input
    title = input("Enter the title for the matrix: ")

    # Function to get a valid number for criteria or options
    def get_positive_integer(prompt):
        while True:
            try:
                value = int(input(prompt))
                if value < 1:
                    print("Numbers must be greater than 0. Try again.")
                    continue
                return value
            except ValueError:
                print("Invalid input! Please enter a valid number.")

    # Get the number of criteria and options
    num_criteria = get_positive_integer("Enter number of criteria: ")
    num_options = get_positive_integer("Enter number of options: ")

    def get_month_name(r):
        # List of valid month names
        valid_months = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"]

        while True:
            # Asking the user to enter the month
            month = input("Please enter the month name: ").strip().capitalize()

            if month in valid_months:
                names = []
                for i in range(r):
                    names.append(valid_months[(valid_months.index(month) + i) % 12])
                return names
            else:
                print("Invalid month name. Please try again.")  # Error message for invalid month

    # Row and column name selection like POM
    print("\nSelect row names for criteria:")
    print("1. Criterion 1, Criterion 2, Criterion 3...")
    print("2. a, b, c, d, e, ...")
    print("3. A, B, C, D, E, ...")
    print("4. 1, 2, 3, 4, 5, ...")
    print("5. January, February, March, ...")
    print("6. Other")

    while True:
        try:
            criteria_choice = int(input("Enter your choice (1-6): "))
            if criteria_choice not in range(1, 7):
                print("Invalid choice! Please enter a number between 1 and 6.")
                continue
            break
        except ValueError:
            print("Invalid input! Please enter a valid number.")

    # Handle month selection or custom names
    if criteria_choice == 5:  # Month names
        criteria_names = get_month_name(num_criteria)
    elif criteria_choice == 6:  # Custom criteria names
        criteria_names = [input(f"Enter name for Criterion {i + 1}: ") for i in range(num_criteria)]
    else:  # Preset names based on choice
        preset_options = [
            [f"Criterion {i + 1}" for i in range(num_criteria)],
            [chr(97 + i) for i in range(num_criteria)],  # 'a', 'b', 'c', ...
            [chr(65 + i) for i in range(num_criteria)],  # 'A', 'B', 'C', ...
            [str(i + 1) for i in range(num_criteria)],   # '1', '2', '3', ...
        ]
        criteria_names = preset_options[criteria_choice - 1]

    # Select column names for options
    print("\nSelect column names for options:")
    print("1. Option 1, Option 2, Option 3...")
    print("2. a, b, c, d, e, ...")
    print("3. A, B, C, D, E, ...")
    print("4. 1, 2, 3, 4, 5, ...")
    print("5. January, February, March, ...")
    print("6. Other")

    while True:
        try:
            option_choice = int(input("Enter your choice (1-6): "))
            if option_choice not in range(1, 7):
                print("Invalid choice! Please enter a number between 1 and 6.")
                continue
            break
        except ValueError:
            print("Invalid input! Please enter a valid number.")

    if option_choice == 5:  # Month names
        option_names = get_month_name(num_options)
    elif option_choice == 6:  # Custom option names
        option_names = [input(f"Enter name for Option {j + 1}: ") for j in range(num_options)]
    else:  # Preset names based on choice
        preset_options = [
            [f"Option {j + 1}" for j in range(num_options)],
            [chr(97 + j) for j in range(num_options)],  # 'a', 'b', 'c', ...
            [chr(65 + j) for j in range(num_options)],  # 'A', 'B', 'C', ...
            [str(j + 1) for j in range(num_options)],   # '1', '2', '3', ...
        ]
        option_names = preset_options[option_choice - 1]

    # Input for weights of each criterion
    weights = []
    print("\nEnter the weights for each criterion (all weights should sum up to 1):")
    total_weight = 0
    for i, name in enumerate(criteria_names):
        while True:
            try:
                weight = float(input(f"Weight for {name}: "))
                weights.append(weight)
                total_weight += weight
                break
            except ValueError:
                print("Invalid input! Please enter a valid number.")

    # Input for options' scores
    options_scores = []
    for j, option_name in enumerate(option_names):
        print(f"\nEnter scores for {option_name}:")
        scores = []
        for i, criterion_name in enumerate(criteria_names):
            while True:
                try:
                    score = float(input(f"Score for {criterion_name}: "))
                    scores.append(score)
                    break
                except ValueError:
                    print("Invalid input! Please enter a valid number.")
        options_scores.append(scores)

    # Calculate weighted totals and averages (adjusting for weights not summing to 1)
    weighted_totals = []
    for j in range(num_options):
        weighted_total = sum(weights[i] * options_scores[j][i] for i in range(num_criteria))
        weighted_totals.append(weighted_total)

    # Print formatted results similar to the provided image
    print(f"\n{title} Solution\n")
    print(f"{'':<20}{'Weights':<10}{''.join([f'{option:<10}' for option in option_names])}")

    # Printing the criteria, weights, and scores for each option
    for i in range(num_criteria):
        row = f"{criteria_names[i]:<20}{weights[i]:<10}{''.join([f'{options_scores[j][i]:<10}' for j in range(num_options)])}"
        print(row)

    # Printing total weights row
    total_weight_sum = round(sum(weights), 1)
    print(f"{'':<20}{total_weight_sum:<10}")

    # Printing weighted totals and weighted averages below the table
    print(f"\n{'Weighted Total':<30}{''.join([f'{weighted_totals[j]:<10.2f}' for j in range(num_options)])}")
    print(f"{'Weighted Average':<30}{''.join([f'{weighted_totals[j] / total_weight_sum:<10.2f}' for j in range(num_options)])}")


# Run the function
preference_matrix()
