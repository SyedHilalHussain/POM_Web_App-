from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Include the api app's urls
    # Catch-all pattern that serves React's index.html for any frontend route
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),

]
