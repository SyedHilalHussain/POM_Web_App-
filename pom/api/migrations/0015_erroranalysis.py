# Generated by Django 4.2 on 2025-07-06 07:41

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_kanbancomputation'),
    ]

    operations = [
        migrations.CreateModel(
            name='ErrorAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('input_data', models.JSONField()),
                ('output_data', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('chart_url', models.TextField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Error_analysis', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
