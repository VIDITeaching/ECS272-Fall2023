import pandas as pd

# Reading the data
df = pd.read_csv("pokemon_alopez247.csv")

# Understanding the data
'''
print(df.head())
print(df.columns)
for col in df.columns:
	print(col)
	print(df[col].unique())
	print("\n\n")
'''

# Only "Pr_Male" column contains nan values so it is ignored as I do not consider this column in my visualizations

# Obtaining data for StarPlot.vue
'''
print("HP", df.HP.mean())
print("Sp_Atk", df.Sp_Atk.mean())
print("Attack", df.Attack.mean())
print("Sp_Def", df.Sp_Def.mean())
print("Defense", df.Defense.mean())
print("Speed", df.Speed.mean())
star_columns = ['HP', 'Sp_Atk', 'Attack', 'Sp_Def', 'Defense', 'Speed']
category_map = {'HP': "HP", 'Sp_Atk': "Sp. Attack", 'Attack': "Attack", 'Sp_Def': "Sp. Defense", 'Defense': "Defense", 'Speed': "Speed"}
star_data = {"data": []}
for col in star_columns:
	current_dict = {"value": int(round(df[col].mean(), 0)), "category": category_map[col]}
	star_data["data"].append(current_dict)
print(star_data)
import json
with open('star_data.json', 'w') as outfile:
	json.dump(star_data, outfile)
'''


# Obtaining data for BarPlot.vue
# Group by 'Type_1' and count categories in 'Generation'
bar_data = pd.crosstab(index=df['Type_1'], columns=df['Generation'])
bar_data.reset_index(level=0, inplace=True)
bar_data.reset_index(drop=True, inplace=True)
bar_data.to_csv("bar_data.csv", index=False)
print(bar_data)


# print(df.groupall().agg({'HP': 'mean', 'Sp_Atk': 'mean', 'Attack': 'mean', 'Sp_Def': 'mean', 'Defense': 'mean', 'Speed': 'mean'}))