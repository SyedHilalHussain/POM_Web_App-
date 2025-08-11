def process_decision_table_input(input_data):
    try:
        num_scenarios = int(input_data["num_scenarios"])
        num_options = int(input_data["num_options"])
        objective = input_data["objective"]  # "Profits (maximize)" or "Costs (minimize)"
        probabilities = list(map(float, input_data["probabilities"]))
        payoffs = input_data["payoffs"]  # list of lists

        row_names = input_data.get("row_names", [f"Option {i+1}" for i in range(num_options)])
        column_names = input_data.get("column_names", [f"Scenario {j+1}" for j in range(num_scenarios)])


        total_prob = sum(probabilities)
        # Validation
        if len(probabilities) != num_scenarios:
            return None, "Number of probabilities must match number of scenarios."
        if not (abs(total_prob - 1.0) <= 0.01 or abs(total_prob) <= 0.00001):
            return None, "Probabilities must sum to 1 or be all zero."

        expected_values = []
        if total_prob > 0:
            expected_values = [sum(p * v for p, v in zip(probabilities, option)) for option in payoffs]
        else:
            # All zero probabilities: skip EV calculation (or set to None/0)
            expected_values = [0 for _ in payoffs]

        min_values = [min(option) for option in payoffs]
        max_values = [max(option) for option in payoffs]

        if objective == "Profits (maximize)":
            best_ev = max(expected_values)
            best_ev_opt = expected_values.index(best_ev)
            best_maximin = max(min_values)
            best_maximin_opt = min_values.index(best_maximin)
            best_maximax = max(max_values)
            best_maximax_opt = max_values.index(best_maximax)
        else:  # Costs (minimize)
            best_ev = min(expected_values)
            best_ev_opt = expected_values.index(best_ev)
            best_minimin = min(min_values)
            best_minimin_opt = min_values.index(best_minimin)
            best_minimax = min(max_values)
            best_minimax_opt = max_values.index(best_minimax)

        # Regret table
        regret_matrix = []
        for s in range(num_scenarios):
            if objective == "Profits (maximize)":
                best_scenario_val = max(payoffs[o][s] for o in range(num_options))
            else:
                best_scenario_val = min(payoffs[o][s] for o in range(num_options))
            regrets = [abs(best_scenario_val - payoffs[o][s]) for o in range(num_options)]
            for o in range(num_options):
                if len(regret_matrix) <= o:
                    regret_matrix.append([])
                regret_matrix[o].append(regrets[o])

        max_regrets = [max(row) for row in regret_matrix]
        minimax_value = min(max_regrets)
        minimax_option = max_regrets.index(minimax_value)

        # Table 1: Main Decision Table
        table1 = []
        for i in range(num_options):
            table1.append({
            "Option": row_names[i],
            **{column_names[j]: round(payoffs[i][j], 2) for j in range(num_scenarios)},
            "Expected Value": round(expected_values[i], 2),
            "Row Min": round(min_values[i], 2),
            "Row Max": round(max_values[i], 2)
        })


        # Summary row for Table 1
        # Summary row for Table 1
        table1_summary = {
        "maximum": round(max(expected_values), 2),
        "Best EV": round(best_ev, 2),
        "maximin": round(best_maximin if objective == "Profits (maximize)" else best_minimin, 2),
        "maximax": round(best_maximax if objective == "Profits (maximize)" else best_minimax, 2)
    }



        # Table 2: Expected Value Multiplications
        table2 = []
        if total_prob > 0:
            for i in range(num_options):
                row_data = {}
                for j in range(num_scenarios):
                    row_data[column_names[j]] = round(payoffs[i][j] * probabilities[j], 2)
                row_data["Row sum (Exp Val)"] = round(expected_values[i], 2)
                table2.append({"Option": row_names[i], **row_data})
        else:
            table2 = None  # or empty list


        table2_probabilities = {column_names[j]: round(probabilities[j], 2) for j in range(num_scenarios)}


        # Table 3: Regret Table
        table3 = []
        for i in range(num_options):
            row_data = {f"{column_names[j]} Regret": round(regret_matrix[i][j], 2) for j in range(num_scenarios)}
            row_data["Maximum Regret"] = round(max_regrets[i], 2)

            table3.append({"Option": row_names[i], **row_data})

        table3_summary = {"Minimax regret": minimax_value, "Option": row_names[minimax_option]}

        # Final structured output
        output = {
            "Decision Table": {
                "data": table1,
                "summary": table1_summary
            },
            "Regret Table": {
                "data": table3,
                "summary": table3_summary
            }
        }

        # Only include Expected Value Multiplications if total_prob > 0
        if total_prob > 0:
            output["Expected Value Multiplications"] = {
                "probabilities": table2_probabilities,
                "data": table2
            }

        return {"output_data": output}, None

    except Exception as e:
        return None, str(e)

