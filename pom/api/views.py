# views.py
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.shortcuts import render, get_object_or_404
import json
import matplotlib.pyplot as plt
import io
import base64
from math import sqrt
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from .models import CustomUser, AnalysisFile,KanbanComputation, ReorderFile, PreferenceMatrix,ABCAnalysis,DecisionTables, CrossVolume,MultiProductBreakEven,EOQModel
from .serializers import UserProfileSerializer, KanbanComputationSerializer ,AnalysisFileSerializer,ABCAnalysisSerializer, ReorderFileSerializer,DecisionTablesSerializer,MultiProductBreakEvenSerializer,EOQSerializer, PreferenceMatrixSerializer, CrossVolumeSerializer
# Utility function to create JWT tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    print("Received data:", request.data)
    email = data.get('email')  # Use 'email' instead of 'username'
    username = data.get('username')
    password = data.get('password')

    # Check if the email already exists in CustomUser instead of User
    if CustomUser.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Create a new user with the CustomUser model
    user = CustomUser.objects.create_user(email=email,username=username, password=password)
    user.save()


    return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    user = authenticate(email=email, password=password)
    if user is not None:
        tokens = get_tokens_for_user(user)
        return Response(tokens)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

def index(request):
    return render(request, 'index.html')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)



# Function to calculate break-even point and output table values
def calculate_break_even_table(fixed_costs, variable_costs, revenue_per_unit, volume):
    if revenue_per_unit <= variable_costs:
        raise ValueError("Revenue per unit must be greater than variable costs per unit.")

    # Calculate break-even points
    break_even_units = fixed_costs / (revenue_per_unit - variable_costs)
    break_even_revenue = break_even_units * revenue_per_unit

    # Prepare the table data for output (matching your table format)
    total_variable_costs = volume * variable_costs
    total_revenue = volume * revenue_per_unit
    total_costs = fixed_costs + total_variable_costs
    net_profit = total_revenue - total_costs

    return {
        'break_even_units': break_even_units,
        'break_even_revenue': break_even_revenue,
        'volume': volume,
        'total_variable_costs': total_variable_costs,
        'total_revenue': total_revenue,
        'total_costs': total_costs,
        'net_profit': net_profit,
    }


# Function to generate the chart and return as base64
def generate_chart(fixed_costs, variable_costs, revenue_per_unit, break_even_units, volume):
    units = list(range(int(volume) + 1))
    total_costs = [fixed_costs + variable_costs * u for u in units]
    total_revenue = [revenue_per_unit * u for u in units]

    plt.figure(figsize=(10, 6))
    plt.plot(units, total_costs, label="Total Costs", color='red')
    plt.plot(units, total_revenue, label="Total Revenue", color='green')
    plt.axvline(x=break_even_units, color='blue', linestyle='--', label=f"Break-even at {int(break_even_units)} units")
    plt.title('Break-even Analysis')
    plt.xlabel('Units')
    plt.ylabel('Amount ($)')
    plt.legend()
    plt.grid(True)

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    chart_url = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    return f'data:image/png;base64,{chart_url}'


@api_view(['POST'])
def break_even_analysis(request):
    try:
        data = json.loads(request.body)
        fixed_costs = float(data['fixedCosts'])
        variable_costs = float(data['variableCosts'])
        revenue_per_unit = float(data['revenuePerUnit'])
        volume = float(data['volume'])

        # Calculate the detailed break-even table data
        table_data = calculate_break_even_table(fixed_costs, variable_costs, revenue_per_unit, volume)

        # Generate the chart
        chart_url = generate_chart(fixed_costs, variable_costs, revenue_per_unit, table_data['break_even_units'],
                                   volume)

        # Send back the full results including the table data and chart
        return JsonResponse({
            'fixedCosts': fixed_costs,
            'variableCosts': variable_costs,
            'revenuePerUnit': revenue_per_unit,
            'breakEvenUnits': table_data['break_even_units'],
            'breakEvenRevenue': table_data['break_even_revenue'],
            'totalVariableCosts': table_data['total_variable_costs'],
            'totalRevenue': table_data['total_revenue'],
            'totalCosts': table_data['total_costs'],
            'netProfit': table_data['net_profit'],
            'chart_url': chart_url
        })
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'An error occurred during the calculation.'}, status=500)


# breakeven dynamic file saving code

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_analysis_file(request):
    """Handles creation of a new analysis file"""
    user = request.user
    name = request.data.get('name')
    input_data = request.data.get('input_data')

    if not name or not input_data:
        return Response({'error': 'File name and input data are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Calculate output data
        output_data = calculate_break_even_table(
            fixed_costs=float(input_data['fixedCosts']),
            variable_costs=float(input_data['variableCosts']),
            revenue_per_unit=float(input_data['revenuePerUnit']),
            volume=float(input_data['volume'])
        )
        chart_url = generate_chart(
            fixed_costs=float(input_data['fixedCosts']),
            variable_costs=float(input_data['variableCosts']),
            revenue_per_unit=float(input_data['revenuePerUnit']),
            break_even_units=output_data['break_even_units'],
            volume=float(input_data['volume'])
        )

        # Create and save a new analysis file
        analysis_file = AnalysisFile.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data={**output_data, 'chart_url': chart_url}
        )

        serializer = AnalysisFileSerializer(analysis_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_analysis_file(request, file_id):
    """Handles updating an existing analysis file"""
    try:
        # Get the existing file by user and ID
        analysis_file = AnalysisFile.objects.get(id=file_id, user=request.user)

        # Update file details
        name = request.data.get('name', analysis_file.name)  # Default to current name if not provided
        input_data = request.data.get('input_data', analysis_file.input_data)  # Default to current input_data

        # Calculate updated output data
        output_data = calculate_break_even_table(
            fixed_costs=float(input_data['fixedCosts']),
            variable_costs=float(input_data['variableCosts']),
            revenue_per_unit=float(input_data['revenuePerUnit']),
            volume=float(input_data['volume'])
        )
        chart_url = generate_chart(
            fixed_costs=float(input_data['fixedCosts']),
            variable_costs=float(input_data['variableCosts']),
            revenue_per_unit=float(input_data['revenuePerUnit']),
            break_even_units=output_data['break_even_units'],
            volume=float(input_data['volume'])
        )

        # Update and save the file
        analysis_file.name = name
        analysis_file.input_data = input_data
        analysis_file.output_data = {**output_data, 'chart_url': chart_url}
        analysis_file.save()

        serializer = AnalysisFileSerializer(analysis_file)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except AnalysisFile.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_analysis_files(request):
    user = request.user
    analysis_files = AnalysisFile.objects.filter(user=user)
    serializer = AnalysisFileSerializer(analysis_files, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def retrieve_analysis_file(request, file_id):
    try:
        analysis_file = AnalysisFile.objects.get(id=file_id, user=request.user)
    except AnalysisFile.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AnalysisFileSerializer(analysis_file)
    return Response(serializer.data)






# 🔹 Calculate Crossover Cost-Volume Analysis(Break Even Analysis)
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
def calculate_crossover(input_data):
    try:
        # Extract input data
        volume = input_data.get("volume", 0)
        options = input_data.get("options", {})

        output_data = {
            "breakeven_points": {},
            "volume_analysis": {
                "volume": volume,
                "total_fixed_costs": {},
                "total_variable_costs": {},
                "total_costs": {}
            }
        }

        # Compute total costs dynamically
        total_costs = {}
        for option_name, cost_values in options.items():
            fixed_cost = cost_values[0]  # First value is fixed cost
            variable_cost = sum(cost_values[1:])  # Sum all remaining values as variable costs

            total_variable_cost = variable_cost * volume
            total_cost = fixed_cost + total_variable_cost

            output_data["volume_analysis"]["total_fixed_costs"][option_name] = fixed_cost
            output_data["volume_analysis"]["total_variable_costs"][option_name] = total_variable_cost
            output_data["volume_analysis"]["total_costs"][option_name] = total_cost

            total_costs[option_name] = (fixed_cost, variable_cost)

        # Compute breakeven points for all option combinations
        option_names = list(total_costs.keys())
        for i in range(len(option_names)):
            for j in range(i + 1, len(option_names)):
                opt1, opt2 = option_names[i], option_names[j]
                f1, v1 = total_costs[opt1]
                f2, v2 = total_costs[opt2]

                if v1 != v2:
                    units = (f2 - f1) / (v1 - v2)
                    dollars = f1 + (v1 * units)
                    if units < 0:
                        units, dollars = "NONE", None
                else:
                    units, dollars = "NONE", None

                output_data["breakeven_points"][f"{opt1} vs. {opt2}"] = {
                    "units": units,
                    "dollars": dollars
                }

        return {"status": "success", "data": output_data}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# 🔹 Save Crossover Analysis to Database
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_crossover(request):
    try:
        user = request.user
        name = request.data.get('name')
        input_data = request.data.get('input_data')

        if not name or not input_data:
            return Response({'error': 'Name and input data are required.'}, status=status.HTTP_400_BAD_REQUEST)

        output_data = calculate_crossover(input_data)

        cross_volume = CrossVolume.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data=output_data
        )

        serializer = CrossVolumeSerializer(cross_volume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 🔹 Update an Existing Crossover Entry
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_crossover(request, file_id):
    try:
        cross_volume = get_object_or_404(CrossVolume, id=file_id, user=request.user)
        input_data = request.data.get('input_data')
        name = request.data.get('name')

        if not input_data:
            return Response({'error': 'Updated input data is required'}, status=status.HTTP_400_BAD_REQUEST)

        cross_volume.name = name
        cross_volume.input_data = input_data
        cross_volume.output_data = calculate_crossover(input_data)
        cross_volume.save()

        serializer = CrossVolumeSerializer(cross_volume)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 🔹 List All Crossover Analysis Files for a User
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_crossover_files(request):
    cross_volumes = CrossVolume.objects.filter(user=request.user)
    serializer = CrossVolumeSerializer(cross_volumes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔹 Retrieve a Specific Crossover Analysis File
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_crossover(request, file_id):
    cross_volume = get_object_or_404(CrossVolume, id=file_id, user=request.user)
    serializer = CrossVolumeSerializer(cross_volume)
    return Response(serializer.data, status=status.HTTP_200_OK)

#  🔹 Calculate Multiproduct Breakeven  Analysis(Break Even Analysis)

def calculate_multiproduct_breakeven(input_data):
    try:
        items = input_data.get("items", [])
        total_fixed_cost = input_data.get("fixed_cost", 0)

        total_revenue = 0
        total_variable_cost = 0
        total_sales_dollars = 0

        result = {"items": [], "breakeven_point": None}

        # Step 1: Calculate revenue, variable costs, and contribution margins
        for item in items:
            price = item.get("price", 0)
            cost = item.get("cost", 0)
            forecast = item.get("forecast", 0)

            revenue = price * forecast
            variable_cost = cost * forecast

            VP =  cost / price if price != 0 else 0
            contribution_margin   = 1 - VP  # (1 - (V/P))

            total_revenue += revenue
            total_variable_cost += variable_cost
            total_sales_dollars += revenue

            result["items"].append({
                "name": item.get("name", ""),
                "price": price,
                "cost": cost,
                "forecast": forecast,
                "forecast_sales_dollars": revenue,
                "vp": VP,
                "one_minus_vp": contribution_margin
            })

        # Step 2: Calculate % of sales and Weighted Contribution
        weighted_contribution = 0
        for item in result["items"]:
            item["sales_percentage"] = item[
                                           "forecast_sales_dollars"] / total_sales_dollars if total_sales_dollars != 0 else 0
            item["weighted_contribution"] = item["sales_percentage"] * item["vp"]
            weighted_contribution += item["weighted_contribution"]

        # Step 3: Calculate Break-even Point
        breakeven_point = total_fixed_cost / weighted_contribution if weighted_contribution != 0 else None

        result["breakeven_point"] = breakeven_point
        return {"status": "success", "data": result}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_multiproduct(request):
    """Save Multiproduct Break-Even Analysis"""
    try:
        user = request.user
        name = request.data.get('name')
        input_data = request.data.get('input_data')

        if not name or not input_data:
            return Response({'error': 'Name and input data are required.'}, status=status.HTTP_400_BAD_REQUEST)

        output_data = calculate_multiproduct_breakeven(input_data)

        multiproduct = MultiProductBreakEven.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data=output_data
        )

        serializer = MultiProductBreakEvenSerializer(multiproduct)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_multiproduct(request, file_id):
    """Update an existing Multiproduct Break-Even Analysis"""
    try:
        multiproduct = get_object_or_404(MultiProductBreakEven, id=file_id, user=request.user)
        input_data = request.data.get('input_data')

        if not input_data:
            return Response({'error': 'Updated input data is required'}, status=status.HTTP_400_BAD_REQUEST)

        multiproduct.input_data = input_data
        multiproduct.output_data = calculate_multiproduct_breakeven(input_data)
        multiproduct.save()

        serializer = MultiProductBreakEvenSerializer(multiproduct)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_multiproduct_files(request):
    """List all Multiproduct Break-Even Analysis files for the logged-in user"""
    files = MultiProductBreakEven.objects.filter(user=request.user)
    serializer = MultiProductBreakEvenSerializer(files, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def retrieve_multiproduct(request, file_id):
    """Retrieve a specific Multiproduct Break-Even Analysis file"""
    multiproduct = get_object_or_404(MultiProductBreakEven, id=file_id, user=request.user)
    serializer = MultiProductBreakEvenSerializer(multiproduct)
    return Response(serializer.data, status=status.HTTP_200_OK)
# Function to calculate safety stock and reorder point
def calculate_safety_stock_and_reorder_point(parameters, probabilities):
    reorder_point_without_safety_stock = parameters["ReorderPointWithoutSafetyStock"]
    carrying_cost = parameters["CarryingCostPerYear"]
    stockout_cost = parameters["StockoutCostPerUnit"]
    orders_per_year = parameters["OrdersPerYear"]

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

    return {
        "SafetyStock": safety_stock,
        "RevisedReorderPoint": revised_reorder_point,
        "MinimalCost": min_cost
    }


# API to calculate reorder point and safety stock
@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_reorder_point(request):
    try:
        data = json.loads(request.body)
        parameters = data.get('parameters', {})
        probabilities = data.get('probabilities', {})

        # Validate inputs
        if not parameters or not probabilities:
            return Response({'error': 'Invalid parameters or probabilities.'}, status=status.HTTP_400_BAD_REQUEST)

        probabilities = {float(k): float(v) for k, v in probabilities.items()}

        # Calculate results
        results = calculate_safety_stock_and_reorder_point(parameters, probabilities)

        return Response({
            'parameters': parameters,
            'probabilities': probabilities,
            'results': results
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API to save analysis
@api_view(['POST'])
@permission_classes([AllowAny])
def save_reorder_file(request):
    try:
        user = request.user
        name = request.data.get('name')
        parameters = request.data.get('parameters')
        probabilities = request.data.get('probabilities')

        if not name or not parameters or not probabilities:
            return Response({'error': 'Name, parameters, and probabilities are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Calculate results
        probabilities = {float(k): float(v) for k, v in probabilities.items()}
        results = calculate_safety_stock_and_reorder_point(parameters, probabilities)

        # Save analysis file
        analysis_file = ReorderFile.objects.create(
            user=user,
            name=name,
            input_data={'parameters': parameters, 'probabilities': probabilities},
            output_data=results
        )

        serializer = ReorderFileSerializer(analysis_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API to update analysis file
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_reorder_file(request, file_id):
    try:
        analysis_file = ReorderFile.objects.get(id=file_id, user=request.user)

        name = request.data.get('name', analysis_file.name)
        parameters = request.data.get('parameters', analysis_file.input_data.get('parameters'))
        probabilities = request.data.get('probabilities', analysis_file.input_data.get('probabilities'))

        # Calculate updated results
        probabilities = {float(k): float(v) for k, v in probabilities.items()}
        results = calculate_safety_stock_and_reorder_point(parameters, probabilities)

        # Update analysis file
        analysis_file.name = name
        analysis_file.input_data = {'parameters': parameters, 'probabilities': probabilities}
        analysis_file.output_data = results
        analysis_file.save()

        serializer = ReorderFileSerializer(analysis_file)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ReorderFile.DoesNotExist:
        return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API to list analysis files
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_reorder_files(request):
    user = request.user
    analysis_files = ReorderFile.objects.filter(user=user)
    serializer = ReorderFileSerializer(analysis_files, many=True)
    return Response(serializer.data)


# API to retrieve an analysis file
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_reorder_file(request, file_id):
    try:
        analysis_file = ReorderFile.objects.get(id=file_id, user=request.user)
        serializer = ReorderFileSerializer(analysis_file)
        return Response(serializer.data)
    except AnalysisFile.DoesNotExist:
        return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)


# Preference Matrix Api's are below

def calculate_preference_matrix(input_data):
    """
    Core function to calculate weighted totals and averages for the preference matrix.
    """
    criteria_names = input_data['criteriaNames']
    option_names = input_data['optionNames']
    weights = input_data['weights']
    scores = input_data['scores']

    # Ensure weights sum to 1
    total_weight_sum = round(sum(weights), 1)
    if total_weight_sum != 1:
        raise ValueError("Weights must sum to 1.")

    # Calculate weighted totals and averages
    weighted_totals = [
        sum(weights[i] * scores[i][j] for i in range(len(criteria_names)))
        for j in range(len(option_names))
    ]
    weighted_averages = [
        weighted_total / total_weight_sum for weighted_total in weighted_totals
    ]

    return {
        "weightedTotals": weighted_totals,
        "weightedAverages": weighted_averages,
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_matrix(request):
    """
    API endpoint to calculate the preference matrix.
    """
    try:
        input_data = json.loads(request.body)
        results = calculate_preference_matrix(input_data)

        # Debugging output
        print("DEBUG: Input Data:", input_data)
        print("DEBUG: Computed Results:", results)

        return Response({"input_data": input_data, "results": results}, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_matrix(request):
    """
    API endpoint to save the preference matrix in the database.
    """
    try:
        user = request.user
        name = request.data.get('name')
        input_data = request.data.get('input_data')

        if not name or not input_data:
            return Response({'error': 'Name and input data are required.'}, status=status.HTTP_400_BAD_REQUEST)

        results = calculate_preference_matrix(input_data)

        preference_matrix = PreferenceMatrix.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data=results
        )

        serializer = PreferenceMatrixSerializer(preference_matrix)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_matrix(request, matrix_id):
    try:
        preference_matrix = PreferenceMatrix.objects.get(id=matrix_id, user=request.user)

        name = request.data.get('name', preference_matrix.name)
        input_data = request.data.get('input_data', preference_matrix.input_data)

        results = calculate_preference_matrix(input_data)

        preference_matrix.name = name
        preference_matrix.input_data = input_data
        preference_matrix.output_data = results
        preference_matrix.save()

        serializer = PreferenceMatrixSerializer(preference_matrix)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except PreferenceMatrix.DoesNotExist:
        return Response({'error': 'Matrix not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_matrices(request):
    user = request.user
    matrices = PreferenceMatrix.objects.filter(user=user)
    serializer = PreferenceMatrixSerializer(matrices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_matrix(request, matrix_id):
    try:
        preference_matrix = PreferenceMatrix.objects.get(id=matrix_id, user=request.user)
        serializer = PreferenceMatrixSerializer(preference_matrix)
        return Response(serializer.data)
    except PreferenceMatrix.DoesNotExist:
        return Response({'error': 'Matrix not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    


# Decision Tables module api's
def calculate_decision_table(input_data):
    """
    Perform decision analysis and calculate EV, Maximin, Maximax, and Regret Table.
    """
    num_scenarios = len(input_data['probabilities'])
    num_options = len(input_data['payoffs'])
    probabilities = input_data['probabilities']
    payoffs = input_data['payoffs']
    objective = input_data['objective']

    # Ensure probabilities sum to 1
    if abs(sum(probabilities) - 1.0) > 0.01:
        raise ValueError("Probabilities must sum to 1.")

    # Calculate Expected Values (EV)
    expected_values = [
        sum(p * v for p, v in zip(probabilities, option)) for option in payoffs
    ]

    # Calculate Maximin and Maximax
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

    # Create Regret Table
    regret_table = []
    for scenario_idx in range(num_scenarios):
        if objective == "Profits (maximize)":
            best_scenario_value = max(payoffs[option_idx][scenario_idx] for option_idx in range(num_options))
        else:
            best_scenario_value = min(payoffs[option_idx][scenario_idx] for option_idx in range(num_options))

        regrets = [abs(best_scenario_value - payoffs[option_idx][scenario_idx]) for option_idx in range(num_options)]
        regret_table.append(regrets)

    return {
        "expectedValues": expected_values,
        "maximinValues": maximin_values,
        "maximaxValues": maximax_values,
        "bestEV": {"value": best_ev, "option": best_option_ev},
        "bestMaximin": {"value": best_maximin, "option": best_option_maximin},
        "bestMaximax": {"value": best_maximax, "option": best_option_maximax},
        "regretTable": regret_table
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_table(request):
    try:
        input_data = json.loads(request.body)
        results = calculate_decision_table(input_data)
        return Response({"input_data": input_data, "results": results}, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_table(request):
    try:
        user = request.user
        name = request.data.get('name')
        input_data = request.data.get('input_data')

        if not name or not input_data:
            return Response({"error": "Name and input data are required."}, status=status.HTTP_400_BAD_REQUEST)

        results = calculate_decision_table(input_data)

        decision_table = DecisionTables.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data=results
        )

        serializer = DecisionTablesSerializer(decision_table)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_table(request, table_id):
    try:
        decision_table = DecisionTables.objects.get(id=table_id, user=request.user)

        name = request.data.get("name", decision_table.name)
        input_data = request.data.get("input_data", decision_table.input_data)

        results = calculate_decision_table(input_data)

        decision_table.name = name
        decision_table.input_data = input_data
        decision_table.output_data = results
        decision_table.save()

        serializer = DecisionTablesSerializer(decision_table)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except DecisionTables.DoesNotExist:
        return Response({"error": "Table not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tables(request):
    user = request.user
    tables = DecisionTables.objects.filter(user=user)
    serializer = DecisionTablesSerializer(tables, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_table(request, table_id):
    try:
        decision_table = DecisionTables.objects.get(id=table_id, user=request.user)
        serializer = DecisionTablesSerializer(decision_table)
        return Response(serializer.data)
    except DecisionTables.DoesNotExist:
        return Response({"error": "Table not found."}, status=status.HTTP_404_NOT_FOUND)



#  Inventory Management(Economic Order Quantity)

# 🔹 Calculate EOQ

# 🔹 EOQ Calculation(Without Reorder Point)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_eoq_only(request):
    try:
        input_data = request.data
        demand = float(input_data.get("demand", 0))  # Annual demand (D)
        order_cost = float(input_data.get("order_cost", 0))  # Setup/ordering cost (S)
        holding_cost = float(input_data.get("holding_cost", 0))  # Holding/carrying cost (H)
        unit_cost = float(input_data.get("unit_cost", 0))  # Unit cost

        if demand <= 0 or order_cost <= 0 or holding_cost <= 0:
            return Response({"error": "Demand, order cost, and holding cost must be greater than zero."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Calculate EOQ
        eoq = sqrt((2 * demand * order_cost) / holding_cost)

        # Calculate other metrics (based on your screenshots)
        max_inventory = eoq
        average_inventory = eoq / 2
        orders_per_period = demand / eoq
        annual_setup_cost = orders_per_period * order_cost
        annual_holding_cost = average_inventory * holding_cost
        total_inventory_cost = annual_setup_cost + annual_holding_cost
        unit_costs = demand * unit_cost
        total_cost = total_inventory_cost + unit_costs

        # Format results according to the application
        results = {
            "optimal_order_quantity": round(eoq, 2),
            "maximum_inventory_level": round(max_inventory, 2),
            "average_inventory": round(average_inventory, 2),
            "orders_per_period": round(orders_per_period, 2),
            "annual_setup_cost": round(annual_setup_cost, 2),
            "annual_holding_cost": round(annual_holding_cost, 2),
            "total_inventory_cost": round(total_inventory_cost, 2),
            "unit_costs": round(unit_costs, 2),
            "total_cost": round(total_cost, 2),
            "results_using_eoq": {
                "optimal_order_quantity": round(eoq, 2),
                "maximum_inventory_level": round(max_inventory, 2),
                "average_inventory": round(average_inventory, 2),
                "orders_per_period": round(orders_per_period, 2),
                "annual_setup_cost": round(annual_setup_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "total_inventory_cost": round(total_inventory_cost, 2),
                "unit_costs": round(unit_costs, 2),
                "total_cost": round(total_cost, 2)
            }
        }

        # Add comparison with fixed order quantity if provided
        fixed_quantity = input_data.get("fixed_quantity")
        if fixed_quantity:
            fixed_quantity = float(fixed_quantity)
            fixed_max_inventory = fixed_quantity
            fixed_avg_inventory = fixed_quantity / 2
            fixed_orders_per_period = demand / fixed_quantity
            fixed_annual_setup = fixed_orders_per_period * order_cost
            fixed_annual_holding = fixed_avg_inventory * holding_cost
            fixed_total_inventory = fixed_annual_setup + fixed_annual_holding
            fixed_unit_costs = demand * unit_cost
            fixed_total_cost = fixed_total_inventory + fixed_unit_costs

            results["results_using_fixed"] = {
                "fixed_quantity": fixed_quantity,
                "maximum_inventory_level": round(fixed_max_inventory, 2),
                "average_inventory": round(fixed_avg_inventory, 2),
                "orders_per_period": round(fixed_orders_per_period, 2),
                "annual_setup_cost": round(fixed_annual_setup, 2),
                "annual_holding_cost": round(fixed_annual_holding, 2),
                "total_inventory_cost": round(fixed_total_inventory, 2),
                "unit_costs": round(fixed_unit_costs, 2),
                "total_cost": round(fixed_total_cost, 2)
            }

        return Response(results, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🔹 EOQ Calculation with Reorder Point (ROP)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_eoq_with_rop(request):
    try:
        input_data = request.data
        demand = float(input_data.get("demand", 0))  # Annual demand (D)
        order_cost = float(input_data.get("order_cost", 0))  # Setup/ordering cost (S)
        holding_cost = float(input_data.get("holding_cost", 0))  # Holding/carrying cost (H)
        unit_cost = float(input_data.get("unit_cost", 0))  # Unit cost
        lead_time = float(input_data.get("lead_time", 0))  # Lead time in days
        days_per_year = float(input_data.get("days_per_year", 365))  # Days per year
        daily_demand = float(input_data.get("daily_demand", 0))  # Daily demand rate
        safety_stock = float(input_data.get("safety_stock", 0))  # Safety stock if any

        if demand <= 0 or order_cost <= 0 or holding_cost <= 0:
            return Response({"error": "Demand, order cost, and holding cost must be greater than zero."},
                            status=status.HTTP_400_BAD_REQUEST)

        if lead_time <= 0:
            return Response({"error": "Lead time must be greater than zero for reorder point calculation."},
                            status=status.HTTP_400_BAD_REQUEST)

        # If daily demand is not provided, calculate it from annual demand and days per year
        if daily_demand <= 0 and days_per_year > 0:
            daily_demand = demand / days_per_year

        # Calculate EOQ
        eoq = sqrt((2 * demand * order_cost) / holding_cost)

        # Calculate Reorder Point (ROP)
        reorder_point = (daily_demand * lead_time) + safety_stock

        # Calculate other metrics (based on your screenshots)
        max_inventory = eoq
        average_inventory = eoq / 2
        orders_per_period = demand / eoq
        annual_setup_cost = orders_per_period * order_cost
        annual_holding_cost = average_inventory * holding_cost
        total_inventory_cost = annual_setup_cost + annual_holding_cost
        unit_costs = demand * unit_cost
        total_cost = total_inventory_cost + unit_costs

        # Format results according to the application
        results = {
            "optimal_order_quantity": round(eoq, 2),
            "reorder_point": round(reorder_point, 2),
            "maximum_inventory_level": round(max_inventory, 2),
            "average_inventory": round(average_inventory, 2),
            "orders_per_period": round(orders_per_period, 2),
            "annual_setup_cost": round(annual_setup_cost, 2),
            "annual_holding_cost": round(annual_holding_cost, 2),
            "total_inventory_cost": round(total_inventory_cost, 2),
            "unit_costs": round(unit_costs, 2),
            "total_cost": round(total_cost, 2),
            "results_using_eoq": {
                "optimal_order_quantity": round(eoq, 2),
                "reorder_point": round(reorder_point, 2),
                "maximum_inventory_level": round(max_inventory, 2),
                "average_inventory": round(average_inventory, 2),
                "orders_per_period": round(orders_per_period, 2),
                "annual_setup_cost": round(annual_setup_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "total_inventory_cost": round(total_inventory_cost, 2),
                "unit_costs": round(unit_costs, 2),
                "total_cost": round(total_cost, 2)
            }
        }

        # Add comparison with fixed order quantity if provided
        fixed_quantity = input_data.get("fixed_quantity")
        if fixed_quantity:
            fixed_quantity = float(fixed_quantity)
            fixed_max_inventory = fixed_quantity
            fixed_avg_inventory = fixed_quantity / 2
            fixed_orders_per_period = demand / fixed_quantity
            fixed_annual_setup = fixed_orders_per_period * order_cost
            fixed_annual_holding = fixed_avg_inventory * holding_cost
            fixed_total_inventory = fixed_annual_setup + fixed_annual_holding
            fixed_unit_costs = demand * unit_cost
            fixed_total_cost = fixed_total_inventory + fixed_unit_costs

            results["results_using_fixed"] = {
                "fixed_quantity": fixed_quantity,
                "reorder_point": round(reorder_point, 2),
                "maximum_inventory_level": round(fixed_max_inventory, 2),
                "average_inventory": round(fixed_avg_inventory, 2),
                "orders_per_period": round(fixed_orders_per_period, 2),
                "annual_setup_cost": round(fixed_annual_setup, 2),
                "annual_holding_cost": round(fixed_annual_holding, 2),
                "total_inventory_cost": round(fixed_total_inventory, 2),
                "unit_costs": round(fixed_unit_costs, 2),
                "total_cost": round(fixed_total_cost, 2)
            }

        return Response(results, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🔹 Save EOQ Analysis
# 🔹 Save EOQ Analysis
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_eoq(request):
    try:
        user = request.user
        name = request.data.get('name')
        input_data = request.data.get('input_data')

        if not name or not input_data:
            return Response({'error': 'Name and input data are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate results without creating a new request object
        use_reorder_point = input_data.get('use_reorder_point', False)

        # Prepare calculation data from input_data
        calculation_data = input_data.copy()

        if use_reorder_point:
            # Call calculation function directly with the data
            demand = float(calculation_data.get("demand", 0))
            order_cost = float(calculation_data.get("order_cost", 0))
            holding_cost = float(calculation_data.get("holding_cost", 0))
            unit_cost = float(calculation_data.get("unit_cost", 0))
            lead_time = float(calculation_data.get("lead_time", 0))
            days_per_year = float(calculation_data.get("days_per_year", 365))
            daily_demand = float(calculation_data.get("daily_demand", 0))
            safety_stock = float(calculation_data.get("safety_stock", 0))
            fixed_quantity = calculation_data.get("fixed_quantity")

            # Calculate EOQ
            eoq = sqrt((2 * demand * order_cost) / holding_cost)

            # Calculate Reorder Point (ROP)
            if daily_demand <= 0 and days_per_year > 0:
                daily_demand = demand / days_per_year
            reorder_point = (daily_demand * lead_time) + safety_stock

            # Other calculations
            max_inventory = eoq
            average_inventory = eoq / 2
            orders_per_period = demand / eoq
            annual_setup_cost = orders_per_period * order_cost
            annual_holding_cost = average_inventory * holding_cost
            total_inventory_cost = annual_setup_cost + annual_holding_cost
            unit_costs = demand * unit_cost
            total_cost = total_inventory_cost + unit_costs

            # Format output similar to the calculation function
            output_data = {
                "optimal_order_quantity": round(eoq, 2),
                "reorder_point": round(reorder_point, 2),
                "maximum_inventory_level": round(max_inventory, 2),
                "average_inventory": round(average_inventory, 2),
                "orders_per_period": round(orders_per_period, 2),
                "annual_setup_cost": round(annual_setup_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "total_inventory_cost": round(total_inventory_cost, 2),
                "unit_costs": round(unit_costs, 2),
                "total_cost": round(total_cost, 2)
            }

            # Add fixed quantity calculations if provided
            if fixed_quantity:
                fixed_quantity = float(fixed_quantity)
                fixed_max_inventory = fixed_quantity
                fixed_avg_inventory = fixed_quantity / 2
                fixed_orders_per_period = demand / fixed_quantity
                fixed_annual_setup = fixed_orders_per_period * order_cost
                fixed_annual_holding = fixed_avg_inventory * holding_cost
                fixed_total_inventory = fixed_annual_setup + fixed_annual_holding
                fixed_unit_costs = demand * unit_cost
                fixed_total_cost = fixed_total_inventory + fixed_unit_costs

                output_data["results_using_fixed"] = {
                    "fixed_quantity": fixed_quantity,
                    "reorder_point": round(reorder_point, 2),
                    "maximum_inventory_level": round(fixed_max_inventory, 2),
                    "average_inventory": round(fixed_avg_inventory, 2),
                    "orders_per_period": round(fixed_orders_per_period, 2),
                    "annual_setup_cost": round(fixed_annual_setup, 2),
                    "annual_holding_cost": round(fixed_annual_holding, 2),
                    "total_inventory_cost": round(fixed_total_inventory, 2),
                    "unit_costs": round(fixed_unit_costs, 2),
                    "total_cost": round(fixed_total_cost, 2)
                }
        else:
            # EOQ Only calculation
            demand = float(calculation_data.get("demand", 0))
            order_cost = float(calculation_data.get("order_cost", 0))
            holding_cost = float(calculation_data.get("holding_cost", 0))
            unit_cost = float(calculation_data.get("unit_cost", 0))
            fixed_quantity = calculation_data.get("fixed_quantity")

            # Calculate EOQ
            eoq = sqrt((2 * demand * order_cost) / holding_cost)

            # Other calculations
            max_inventory = eoq
            average_inventory = eoq / 2
            orders_per_period = demand / eoq
            annual_setup_cost = orders_per_period * order_cost
            annual_holding_cost = average_inventory * holding_cost
            total_inventory_cost = annual_setup_cost + annual_holding_cost
            unit_costs = demand * unit_cost
            total_cost = total_inventory_cost + unit_costs

            # Format output similar to the calculation function
            output_data = {
                "optimal_order_quantity": round(eoq, 2),
                "maximum_inventory_level": round(max_inventory, 2),
                "average_inventory": round(average_inventory, 2),
                "orders_per_period": round(orders_per_period, 2),
                "annual_setup_cost": round(annual_setup_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "total_inventory_cost": round(total_inventory_cost, 2),
                "unit_costs": round(unit_costs, 2),
                "total_cost": round(total_cost, 2)
            }

            # Add fixed quantity calculations if provided
            if fixed_quantity:
                fixed_quantity = float(fixed_quantity)
                fixed_max_inventory = fixed_quantity
                fixed_avg_inventory = fixed_quantity / 2
                fixed_orders_per_period = demand / fixed_quantity
                fixed_annual_setup = fixed_orders_per_period * order_cost
                fixed_annual_holding = fixed_avg_inventory * holding_cost
                fixed_total_inventory = fixed_annual_setup + fixed_annual_holding
                fixed_unit_costs = demand * unit_cost
                fixed_total_cost = fixed_total_inventory + fixed_unit_costs

                output_data["results_using_fixed"] = {
                    "fixed_quantity": fixed_quantity,
                    "maximum_inventory_level": round(fixed_max_inventory, 2),
                    "average_inventory": round(fixed_avg_inventory, 2),
                    "orders_per_period": round(fixed_orders_per_period, 2),
                    "annual_setup_cost": round(fixed_annual_setup, 2),
                    "annual_holding_cost": round(fixed_annual_holding, 2),
                    "total_inventory_cost": round(fixed_total_inventory, 2),
                    "unit_costs": round(fixed_unit_costs, 2),
                    "total_cost": round(fixed_total_cost, 2)
                }

        # Create EOQ record
        eoq_record = EOQModel.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data=output_data
        )

        serializer = EOQSerializer(eoq_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🔹 Update an Existing EOQ Entry
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_eoq(request, file_id):
    try:
        eoq_record = get_object_or_404(EOQModel, id=file_id, user=request.user)

        name = request.data.get('name')
        input_data = request.data.get('input_data')

        if not input_data:
            return Response({'error': 'Updated input data is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate results without creating a new request object
        use_reorder_point = input_data.get('use_reorder_point', False)

        # Prepare calculation data from input_data
        calculation_data = input_data.copy()

        if use_reorder_point:
            # Call calculation function directly with the data
            demand = float(calculation_data.get("demand", 0))
            order_cost = float(calculation_data.get("order_cost", 0))
            holding_cost = float(calculation_data.get("holding_cost", 0))
            unit_cost = float(calculation_data.get("unit_cost", 0))
            lead_time = float(calculation_data.get("lead_time", 0))
            days_per_year = float(calculation_data.get("days_per_year", 365))
            daily_demand = float(calculation_data.get("daily_demand", 0))
            safety_stock = float(calculation_data.get("safety_stock", 0))
            fixed_quantity = calculation_data.get("fixed_quantity")

            # Calculate EOQ
            eoq = sqrt((2 * demand * order_cost) / holding_cost)

            # Calculate Reorder Point (ROP)
            if daily_demand <= 0 and days_per_year > 0:
                daily_demand = demand / days_per_year
            reorder_point = (daily_demand * lead_time) + safety_stock

            # Other calculations
            max_inventory = eoq
            average_inventory = eoq / 2
            orders_per_period = demand / eoq
            annual_setup_cost = orders_per_period * order_cost
            annual_holding_cost = average_inventory * holding_cost
            total_inventory_cost = annual_setup_cost + annual_holding_cost
            unit_costs = demand * unit_cost
            total_cost = total_inventory_cost + unit_costs

            # Format output similar to the calculation function
            output_data = {
                "optimal_order_quantity": round(eoq, 2),
                "reorder_point": round(reorder_point, 2),
                "maximum_inventory_level": round(max_inventory, 2),
                "average_inventory": round(average_inventory, 2),
                "orders_per_period": round(orders_per_period, 2),
                "annual_setup_cost": round(annual_setup_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "total_inventory_cost": round(total_inventory_cost, 2),
                "unit_costs": round(unit_costs, 2),
                "total_cost": round(total_cost, 2)
            }

            # Add fixed quantity calculations if provided
            if fixed_quantity:
                fixed_quantity = float(fixed_quantity)
                fixed_max_inventory = fixed_quantity
                fixed_avg_inventory = fixed_quantity / 2
                fixed_orders_per_period = demand / fixed_quantity
                fixed_annual_setup = fixed_orders_per_period * order_cost
                fixed_annual_holding = fixed_avg_inventory * holding_cost
                fixed_total_inventory = fixed_annual_setup + fixed_annual_holding
                fixed_unit_costs = demand * unit_cost
                fixed_total_cost = fixed_total_inventory + fixed_unit_costs

                output_data["results_using_fixed"] = {
                    "fixed_quantity": fixed_quantity,
                    "reorder_point": round(reorder_point, 2),
                    "maximum_inventory_level": round(fixed_max_inventory, 2),
                    "average_inventory": round(fixed_avg_inventory, 2),
                    "orders_per_period": round(fixed_orders_per_period, 2),
                    "annual_setup_cost": round(fixed_annual_setup, 2),
                    "annual_holding_cost": round(fixed_annual_holding, 2),
                    "total_inventory_cost": round(fixed_total_inventory, 2),
                    "unit_costs": round(fixed_unit_costs, 2),
                    "total_cost": round(fixed_total_cost, 2)
                }
        else:
            # EOQ Only calculation
            demand = float(calculation_data.get("demand", 0))
            order_cost = float(calculation_data.get("order_cost", 0))
            holding_cost = float(calculation_data.get("holding_cost", 0))
            unit_cost = float(calculation_data.get("unit_cost", 0))
            fixed_quantity = calculation_data.get("fixed_quantity")

            # Calculate EOQ
            eoq = sqrt((2 * demand * order_cost) / holding_cost)

            # Other calculations
            max_inventory = eoq
            average_inventory = eoq / 2
            orders_per_period = demand / eoq
            annual_setup_cost = orders_per_period * order_cost
            annual_holding_cost = average_inventory * holding_cost
            total_inventory_cost = annual_setup_cost + annual_holding_cost
            unit_costs = demand * unit_cost
            total_cost = total_inventory_cost + unit_costs

            # Format output similar to the calculation function
            output_data = {
                "optimal_order_quantity": round(eoq, 2),
                "maximum_inventory_level": round(max_inventory, 2),
                "average_inventory": round(average_inventory, 2),
                "orders_per_period": round(orders_per_period, 2),
                "annual_setup_cost": round(annual_setup_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "total_inventory_cost": round(total_inventory_cost, 2),
                "unit_costs": round(unit_costs, 2),
                "total_cost": round(total_cost, 2)
            }

            # Add fixed quantity calculations if provided
            if fixed_quantity:
                fixed_quantity = float(fixed_quantity)
                fixed_max_inventory = fixed_quantity
                fixed_avg_inventory = fixed_quantity / 2
                fixed_orders_per_period = demand / fixed_quantity
                fixed_annual_setup = fixed_orders_per_period * order_cost
                fixed_annual_holding = fixed_avg_inventory * holding_cost
                fixed_total_inventory = fixed_annual_setup + fixed_annual_holding
                fixed_unit_costs = demand * unit_cost
                fixed_total_cost = fixed_total_inventory + fixed_unit_costs

                output_data["results_using_fixed"] = {
                    "fixed_quantity": fixed_quantity,
                    "maximum_inventory_level": round(fixed_max_inventory, 2),
                    "average_inventory": round(fixed_avg_inventory, 2),
                    "orders_per_period": round(fixed_orders_per_period, 2),
                    "annual_setup_cost": round(fixed_annual_setup, 2),
                    "annual_holding_cost": round(fixed_annual_holding, 2),
                    "total_inventory_cost": round(fixed_total_inventory, 2),
                    "unit_costs": round(fixed_unit_costs, 2),
                    "total_cost": round(fixed_total_cost, 2)
                }

        # Update the record
        eoq_record.name = name if name else eoq_record.name
        eoq_record.input_data = input_data
        eoq_record.output_data = output_data
        eoq_record.save()

        serializer = EOQSerializer(eoq_record)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_eoq_files(request):
    eoq_records = EOQModel.objects.filter(user=request.user)
    serializer = EOQSerializer(eoq_records, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 🔹 Retrieve a Specific EOQ Record
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_eoq(request, file_id):
    eoq_record = get_object_or_404(EOQModel, id=file_id, user=request.user)
    serializer = EOQSerializer(eoq_record)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ABC Analysis

def perform_abc_analysis(input_data):
    """
    Perform ABC analysis on inventory items.

    Args:
        input_data: Dictionary containing:
            - a_percent: Percentage threshold for A items (0-100)
            - b_percent: Percentage threshold for B items (0-100)
            - items: List of item dictionaries with name, demand, price

    Returns:
        Dictionary with complete ABC analysis results including percentages
    """
    try:
        items = input_data.get('items', [])
        a_percent = input_data.get('a_percent', 0)
        b_percent = input_data.get('b_percent', 0)

        # Validate percentages
        if not (0 <= a_percent <= 100) or not (0 <= b_percent <= 100):
            raise ValueError("Percentages must be between 0 and 100")
        if a_percent + b_percent > 100:
            raise ValueError("Sum of A% and B% cannot exceed 100%")

        # Calculate dollar volume for each item
        for item in items:
            item['dollar_volume'] = item['demand'] * item['price']

        # Sort items by dollar volume in descending order
        sorted_items = sorted(items, key=lambda x: x['dollar_volume'], reverse=True)

        # Calculate total dollar volume
        total_volume = sum(item['dollar_volume'] for item in sorted_items)

        # Calculate percentages and categories
        cumulative_percent = 0
        for item in sorted_items:
            percent = (item['dollar_volume'] / total_volume) * 100
            item['percent_of_vol'] = round(percent, 2)
            cumulative_percent += percent
            item['cumulative_vol_percent'] = round(cumulative_percent, 2)

            # Determine category
            if cumulative_percent <= a_percent:
                item['category'] = 'A'
            elif cumulative_percent <= a_percent + b_percent:
                item['category'] = 'B'
            else:
                item['category'] = 'C'

        # Add total row
        total_row = {
            'item_name': 'TOTAL',
            'demand': sum(item['demand'] for item in sorted_items),
            'price': sum(item['price'] for item in sorted_items),
            'dollar_volume': total_volume,
            'percent_of_vol': None,
            'cumulative_vol_percent': None,
            'category': None
        }

        return {
            'status': 'success',
            'data': {
                'analysis_parameters': {
                    'a_percent': a_percent,
                    'b_percent': b_percent
                },
                'items': sorted_items + [total_row],
                'total_volume': total_volume
            }
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_abc_analysis(request):
    """Save ABC Analysis with percentages in input and output"""
    try:
        user = request.user
        name = request.data.get('name')
        a_percent = request.data.get('a_percent')
        b_percent = request.data.get('b_percent')
        items = request.data.get('items', [])

        if not name or a_percent is None or b_percent is None:
            return Response({'error': 'Name, a_percent, and b_percent are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Prepare input data (includes percentages)
        input_data = {
            'a_percent': a_percent,
            'b_percent': b_percent,
            'items': items
        }

        # Perform calculation
        output_data = perform_abc_analysis(input_data)
        if output_data['status'] == 'error':
            return Response({'error': output_data['message']},
                            status=status.HTTP_400_BAD_REQUEST)

        # Save to database
        abc_analysis = ABCAnalysis.objects.create(
            user=user,
            name=name,
            input_data=input_data,  # Includes percentages
            output_data=output_data['data']  # Also includes percentages
        )

        serializer = ABCAnalysisSerializer(abc_analysis)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_abc_analysis(request, file_id):
    """Update an existing ABC Analysis with percentages"""
    try:
        abc_analysis = get_object_or_404(ABCAnalysis, id=file_id, user=request.user)

        # Get updated data (maintain existing values if not provided)
        name = request.data.get('name', abc_analysis.name)
        a_percent = request.data.get('a_percent', abc_analysis.input_data['a_percent'])
        b_percent = request.data.get('b_percent', abc_analysis.input_data['b_percent'])
        items = request.data.get('items', abc_analysis.input_data.get('items', []))

        # Prepare input data with percentages
        input_data = {
            'a_percent': a_percent,
            'b_percent': b_percent,
            'items': items
        }

        # Perform calculation
        output_data = perform_abc_analysis(input_data)
        if output_data['status'] == 'error':
            return Response({'error': output_data['message']},
                            status=status.HTTP_400_BAD_REQUEST)

        # Update the record
        abc_analysis.name = name
        abc_analysis.input_data = input_data  # Includes percentages
        abc_analysis.output_data = output_data['data']  # Includes percentages
        abc_analysis.save()

        serializer = ABCAnalysisSerializer(abc_analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_abc_analyses(request):
    """List all ABC Analyses with percentages"""
    analyses = ABCAnalysis.objects.filter(user=request.user).order_by('-updated_at')
    serializer = ABCAnalysisSerializer(analyses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def retrieve_abc_analysis(request, file_id):
    """Retrieve a specific ABC Analysis with percentages"""
    abc_analysis = get_object_or_404(ABCAnalysis, id=file_id, user=request.user)
    serializer = ABCAnalysisSerializer(abc_analysis)
    return Response(serializer.data, status=status.HTTP_200_OK)



# Kanban Computation

def calculate_kanban(input_data):
    """
    Perform Kanban computation based on input data.

    Args:
        input_data: Dictionary containing:
            - computationType: 'size' or 'number'
            - parameters: Dictionary of parameters

    Returns:
        Dictionary with computation results
    """
    try:
        computation_type = input_data.get('computationType')
        params = input_data.get('parameters', {})

        daily_demand = params.get('dailyDemand', 0)
        lead_time = params.get('leadTime', 0)
        days_per_year = params.get('daysPerYear', 30)

        if computation_type == 'size':
            safety_stock_percent = params.get('safetyStockPercent', 0)
            # Calculate Kanban size
            safety_stock = (daily_demand * lead_time) * (safety_stock_percent / 100)
            kanban_size = (daily_demand * lead_time) + safety_stock
            number_of_kanbans = None  # Not calculated in this mode
        else:
            safety_stock = params.get('safetyStock', 0)
            kanban_size = params.get('kanbanSize', 0)
            # Calculate number of Kanbans
            number_of_kanbans = ((daily_demand * lead_time) + safety_stock) / kanban_size
            kanban_size = None  # Not calculated in this mode

        return {
            'status': 'success',
            'data': {
                'kanbanSize': kanban_size,
                'numberOfKanbans': number_of_kanbans,
                'dailyDemand': daily_demand,
                'leadTime': lead_time,
                'daysPerYear': days_per_year
            }
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_kanban_computation(request):
    """Save Kanban Computation"""
    try:
        user = request.user
        name = request.data.get('name')
        computation_type = request.data.get('computationType')
        parameters = request.data.get('parameters')

        if not name or not computation_type or not parameters:
            return Response(
                {'error': 'Name, computationType and parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prepare input data
        input_data = {
            'computationType': computation_type,
            'parameters': parameters
        }

        # Perform calculation
        output_data = calculate_kanban(input_data)
        if output_data['status'] == 'error':
            return Response(
                {'error': output_data['message']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to database
        kanban = KanbanComputation.objects.create(
            user=user,
            name=name,
            input_data=input_data,
            output_data=output_data['data']
        )

        serializer = KanbanComputationSerializer(kanban)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_kanban_computation(request, file_id):
    """Update an existing Kanban Computation"""
    try:
        kanban = get_object_or_404(KanbanComputation, id=file_id, user=request.user)

        # Get updated data
        name = request.data.get('name', kanban.name)
        computation_type = request.data.get('computationType', kanban.input_data['computationType'])
        parameters = request.data.get('parameters', kanban.input_data['parameters'])

        # Prepare input data
        input_data = {
            'computationType': computation_type,
            'parameters': parameters
        }

        # Perform calculation
        output_data = calculate_kanban(input_data)
        if output_data['status'] == 'error':
            return Response(
                {'error': output_data['message']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the record
        kanban.name = name
        kanban.input_data = input_data
        kanban.output_data = output_data['data']
        kanban.save()

        serializer = KanbanComputationSerializer(kanban)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_kanban_computations(request):
    """List all Kanban Computations for the logged-in user"""
    computations = KanbanComputation.objects.filter(user=request.user).order_by('-updated_at')
    serializer = KanbanComputationSerializer(computations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def retrieve_kanban_computation(request, file_id):
    """Retrieve a specific Kanban Computation"""
    computation = get_object_or_404(KanbanComputation, id=file_id, user=request.user)
    serializer = KanbanComputationSerializer(computation)
    return Response(serializer.data, status=status.HTTP_200_OK)

