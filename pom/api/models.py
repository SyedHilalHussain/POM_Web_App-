# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.contrib.auth import get_user_model

# Custom user manager class
class CustomUserManager(BaseUserManager):
    def create_user(self, email,username, password=None, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')

        # Normalize the email address and set it on the user instance
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


# Custom User model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, null=False, blank=False)
    username = models.CharField(max_length=30, unique=True, null=False, blank=False)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    def get_short_name(self):
        return self.first_name

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'





User = get_user_model()

class AnalysisFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    input_data = models.JSONField(default=dict)  # Store input as JSON
    output_data = models.JSONField(default=dict)
    chart_url = models.TextField()



class ReorderFile(models.Model):
    """
    Model to store analysis files for reorder point/safety stock calculations.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reorder_point_files')
    name = models.CharField(max_length=255)  # Name of the analysis
    input_data = models.JSONField()  # Store input parameters and probabilities
    output_data = models.JSONField()  # Store calculated results
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp of creation
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp of last update

    def __str__(self):
        return f"{self.name} by {self.user.username}"


class PreferenceMatrix(models.Model):
    """
    Model to store preference matrix data.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    input_data = models.JSONField()  # Store criteria, options, weights, and scores
    output_data = models.JSONField()  # Store calculated results (totals, averages)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class DecisionTables(models.Model):
    """
    Model to store decision table data for decision analysis.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    input_data = models.JSONField()  # Store scenarios, options, probabilities, and payoffs
    output_data = models.JSONField()  # Store EV, Maximin, Maximax, and Regret Table
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CrossVolume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cross_volumes")
    name = models.CharField(max_length=255)
    input_data = models.JSONField()
    output_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.name} - {self.user.username}"


class MultiProductBreakEven(models.Model):
    """Stores Multiproduct Break-Even Analysis results"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="multiproduct_breakevens")
    name = models.CharField(max_length=255)
    input_data = models.JSONField()
    output_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class EOQModel(models.Model):
    """Stores  EOQ MODEL results"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="EOQ_Model")
    name = models.CharField(max_length=255)
    input_data = models.JSONField()
    output_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class ABCAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ABC_analysis")
    name = models.CharField(max_length=255)
    input_data = models.JSONField()  # Will include percentages and items
    output_data = models.JSONField(null=True, blank=True)  # Will include results with percentages
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class KanbanComputation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Kanban_computation")
    name = models.CharField(max_length=255)
    input_data = models.JSONField()  # Stores computation type and parameters
    output_data = models.JSONField()  # Stores results (kanbanSize, numberOfKanbans)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ErrorAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Error_analysis")
    name = models.CharField(max_length=255)
    input_data = models.JSONField()  # Will include actual and forecast values of past periods
    output_data = models.JSONField(null=True, blank=True)  # Will include tracking, details and error analysis and graph
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    chart_url = models.TextField()

    def __str__(self):
        return self.name

class RegressionProjector(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Regression_Projector")
    name = models.CharField(max_length=255)
    input_data = models.JSONField() 
    output_data = models.JSONField(null=True, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
