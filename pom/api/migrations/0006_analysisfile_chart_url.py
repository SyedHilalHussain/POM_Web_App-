# Generated by Django 4.1.7 on 2024-10-28 17:15

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0005_alter_analysisfile_input_data_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="analysisfile",
            name="chart_url",
            field=models.TextField(default=""),
            preserve_default=False,
        ),
    ]
