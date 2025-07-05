# pom/api/urls.py

from django.urls import path
from . import views

urlpatterns = [
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
    path('calculate_decisiontable/', views.calculate_table, name='calculate_table'),
    path('save_decisiontable/', views.save_table, name='save_table'),
    path('update_decisiontable/<int:table_id>/', views.update_table, name='update_table'),
    path('list_decisiontable/', views.list_tables, name='list_tables'),
    path('retrieve_decisiontable/<int:table_id>/', views.retrieve_table, name='retrieve_table'),

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

]