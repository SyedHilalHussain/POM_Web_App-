# api/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, AnalysisFile, ReorderFile, KanbanComputation , PreferenceMatrix, DecisionTables, CrossVolume, MultiProductBreakEven, EOQModel,ABCAnalysis, ErrorAnalysis

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email','username', 'first_name', 'last_name']  # Adjust fields as needed



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Replace 'username' with 'email'
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)

class AnalysisFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisFile
        fields = ['id', 'name', 'created_at', 'updated_at', 'input_data', 'output_data', 'chart_url']



# reorder_point/serializers.py


class ReorderFileSerializer(serializers.ModelSerializer):
    """
    Serializer for the AnalysisFile model to handle Reorder Point/Safety Stock data.
    """

    class Meta:
        model = ReorderFile
        fields = [
            'id',           # Primary key
            'user',         # Related user (foreign key)
            'name',         # Name of the analysis
            'created_at',   # Timestamp of creation
            'updated_at',   # Timestamp of last update
            'input_data',   # Input parameters and probabilities (JSON)
            'output_data',  # Calculated results (JSON)
            # 'chart_url',    # Optional chart data (if any)
        ]

class PreferenceMatrixSerializer(serializers.ModelSerializer):
    """
    Serializer for the PreferenceMatrix model.
    """
    class Meta:
        model = PreferenceMatrix
        fields = [
            'id',
            'user',
            'name',
            'input_data',
            'output_data',
            'created_at',
            'updated_at',
        ]


# Decisions table module serializers
class DecisionTablesSerializer(serializers.ModelSerializer):
    """
    Serializer for the DecisionTable model.
    """
    class Meta:
        model = DecisionTables
        fields = [
            'id',
            'user',
            'name',
            'input_data',
            'output_data',
            'created_at',
            'updated_at',
        ]


class CrossVolumeSerializer(serializers.ModelSerializer):
    """
    Serializer for the CrossVolume model.
    """
    class Meta:
        model = CrossVolume
        fields = [
            'id',
            'user',
            'name',
            'input_data',
            'output_data',
            'created_at',
            'updated_at',
        ]
class MultiProductBreakEvenSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiProductBreakEven
        fields = "__all__"


class EOQSerializer(serializers.ModelSerializer):
    class Meta:
        model = EOQModel
        fields = "__all__"

class ABCAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABCAnalysis
        fields = "__all__"

class KanbanComputationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanbanComputation
        fields = "__all__"

class ErrorAnalysisSerializer(serializers.ModelSerializer):
    """
    Serializer for the ErrorAnalysis model to handle Actual and Forecast data.
    """

    class Meta:
        model = ErrorAnalysis
        fields = [
            'id',           # Primary key
            'user',         # Related user (foreign key)
            'name',         # Name of the analysis
            'created_at',   # Timestamp of creation
            'updated_at',   # Timestamp of last update
            'input_data',   # Input parameters and probabilities (JSON)
            'output_data',  # Calculated results (JSON)
             'chart_url',    # Optional chart data (if any)
        ]
