# Generated by Django 4.1.7 on 2024-10-27 20:54

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0002_alter_customuser_is_superuser"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="username",
            field=models.CharField(default="hilal", max_length=30, unique=True),
            preserve_default=False,
        ),
    ]
