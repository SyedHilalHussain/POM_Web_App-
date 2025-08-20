# pom/api/urls.py

from django.urls import path
from . import views
from .views import MyTokenObtainPairView

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('break-even/', views.break_even_analysis, name='break-even'),
    # breakeven analysis (cost vs revenue)
    path('list-files/', views.list_analysis_files, name='list_analysis_files'),
    path('save-file/', views.save_analysis_file, name='save_analysis_file'),
    path('retrieve-file/<int:file_id>/', views.retrieve_analysis_file, name='retrieve_analysis_file'),
    path('update-file/<int:file_id>/', views.update_analysis_file, name='update_analysis_file'),
# breakeven analysis (Crossover/cost-volumn Analysis)
    path('calculate_crossover/', views.calculate_crossover, name='calculate_crossover'),
    path('save_crossover/', views.save_crossover, name='save_crossover'),
    path('update_crossover/<int:file_id>/', views.update_crossover, name='update_crossover'),
    path('list_crossover/', views.list_crossover_files, name='list_crossover_files'),
    path('retrieve_crossover/<int:file_id>/', views.retrieve_crossover, name='retrieve_crossover'),
    #  Breakeven Analysis (Multiproduct Break Even Analysis)
path('calculate_multiproduct/', views.save_multiproduct, name='calculate_multiproduct'),
    path('save_multiproduct/', views.save_multiproduct, name='save_multiproduct'),
    path('update_multiproduct/<int:file_id>/', views.update_multiproduct, name='update_multiproduct'),
    path('list_multiproduct/', views.list_multiproduct_files, name='list_multiproduct'),
    path('retrieve_multiproduct/<int:file_id>/', views.retrieve_multiproduct, name='retrieve_multiproduct'),

    # reorder
    path('calculate_reorder/', views.calculate_reorder_point, name='calculate_reorder_point'),
    path('save_reorder/', views.save_reorder_file, name='save_reorder_file'),
    path('update_reorder/<int:file_id>/', views.update_reorder_file, name='update_reorder_file'),
    path('list_reorder/', views.list_reorder_files, name='list_reorder_files'),
    path('retrieve_reorder/<int:file_id>/', views.retrieve_reorder_file, name='retrieve_reorder_file'),
    # Preference_Matrix
    path('calculate_preferencematrix/', views.calculate_matrix, name='calculate_matrix'),
    path('save_preferencematrix/', views.save_matrix, name='save_matrix'),
    path('update_preferencematrix/<int:matrix_id>/', views.update_matrix, name='update_matrix'),
    path('list_preferencematrix/', views.list_matrices, name='list_matrices'),
    path('retrieve_preferencematrix/<int:matrix_id>/', views.retrieve_matrix, name='retrieve_matrix'),
    # Decision_table
    path('save_decision_table/', views.save_decision_table, name='save_decision_table'),
    path('update_decision_table/<int:file_id>/', views.update_decision_table, name='update_decision_table'),
    path('list_decision_tables/', views.list_decision_tables, name='list_decision_tables'),
    path('retrieve_decision_table/<int:id>/', views.retrieve_decision_table, name='retrieve_decision_table'),

#     Inventory Management(EOQ)

path('calculate_eoq/', views.calculate_eoq_only, name='calculate_eoq'),
    path('save_eoq/', views.save_eoq, name='save_eoq'),
    path('update_eoq/<int:file_id>/', views.update_eoq, name='update_eoq'),
    path('list_eoq/', views.list_eoq_files, name='list_eoq_files'),
    path('retrieve_eoq/<int:file_id>/', views.retrieve_eoq, name='retrieve_eoq'),

# ABC Analysis

    path('save_abc_analysis/', views.save_abc_analysis, name='save_abc_analysis'),
    path('update_abc_analysis/<int:file_id>/', views.update_abc_analysis, name='update_abc_analysis'),
    path('list_abc_analyses/', views.list_abc_analyses, name='list_abc_analyses'),
    path('retrieve_abc_analysis/<int:file_id>/', views.retrieve_abc_analysis, name='retrieve_abc_analysis'),
# Kanban Computation
    path('save_kanban_computation/', views.save_kanban_computation, name='save_kanban_computation'),
    path('update_kanban_computation/<int:file_id>/', views.update_kanban_computation, name='update_kanban_computation'),
    path('list_kanban_computations/', views.list_kanban_computations, name='list_kanban_computations'),
    path('retrieve_kanban_computation/<int:file_id>/', views.retrieve_kanban_computation, name='retrieve_kanban_computation'),
    # error analysis
    path('save_error_analysis/', views.save_error_analysis, name='save_error_analysis'),
    path('list_error_analysis/', views.list_error_analyses, name='list_error_analysis'),
    path('retrieve_error_analysis/<int:id>/', views.retrieve_error_analysis, name='retrieve_error_analysis'),
    path('update_error_analysis/<int:file_id>/', views.update_error_analysis, name='update_error_analysis'),
    path('error_analysis_preview/', views.error_analysis_preview, name='error_analysis_preview'),

    #regression projector
    path('save_regression_projector/', views.save_regression_projector, name='save_regression_projector'),
    path('update_regression_projector/<int:file_id>/', views.update_regression_projector, name='update_regression_projector'),
    path('list_regressions_projector/', views.list_regression_projector, name='list_regressions_projector'),
    path('retrieve_regression_projector/<int:id>/', views.retrieve_regression_projector, name='retrieve_regression_projector'),

    #Economic Production Lot Size
    path('save_economic_production_lotsize/', views.save_epls, name='save_economic_production_lotsize'),
    path('update_economic_production_lotsize/<int:file_id>/', views.update_epls, name='update_economic_production_lotsize'),
    path('list_economic_production_lotsize/', views.list_epls, name='list_economic_production_lotsize'),
    path('retrieve_economic_production_lotsize/<int:id>/', views.retrieve_epls, name='retrieve_economic_production_lotsize'),

    #Time Study
    path('save_time_study/', views.save_time_study, name='save_time_study'),
    path('update_time_study/<int:file_id>/', views.update_time_study, name='update_time_study'),
    path('list_time_studies/', views.list_time_studies, name='list_time_studies'),
    path('retrieve_time_study/<int:id>/', views.retrieve_time_study, name='retrieve_time_study'),

    #Sample Size For Time Studies
    path('save_sample_size_for_ts/', views.save_sample_size_for_ts, name='save_sample_size_for_ts'),
    path('update_sample_size_for_ts/<int:file_id>/', views.update_sample_size_for_ts, name='update_sample_size_for_ts'),
    path('list_sample_size_for_ts/', views.list_sample_size_for_ts, name='list_sample_size_for_ts'),
    path('retrieve_sample_size_for_ts/<int:id>/', views.retrieve_sample_size_for_ts, name='retrieve_sample_size_for_ts'),

    #Reorder point (Normal Distribution)
    path('save_reorder_normal_dist/', views.save_reorder_normal_dist, name='save_reorder_normal_dist'),
    path('update_reorder_normal_dist/<int:file_id>/', views.update_reorder_normal_dist, name='update_reorder_normal_dist'),
    path('list_reorder_normal_dist/', views.list_reorder_normal_dist, name='list_reorder_normal_dist'),
    path('retrieve_reorder_normal_dist/<int:id>/', views.retrieve_reorder_normal_dist, name='retrieve_reorder_normal_dist'),

    #Quantity Discount (EOQ)
    path('save_quantityDiscountEoq/', views.save_quantityDiscountEoq, name='save_quantityDiscountEoq'),
    path('update_quantityDiscountEoq/<int:file_id>/', views.update_quantityDiscountEoq, name='update_quantityDiscountEoq'),
    path('list_quantityDiscountEoq/', views.list_quantityDiscountEoq, name='list_quantityDiscountEoq'),
    path('retrieve_quantityDiscountEoq/<int:id>/', views.retrieve_quantityDiscountEoq, name='retrieve_quantityDiscountEoq'),
]