import folium
import pandas as pd
from folium.plugins import MarkerCluster

df = pd.read_csv('hostpital_daejeon.csv')  # 파일명 오타 주의
m = folium.Map(location=[36.35, 127.38], zoom_start=12)

sch_cluster = MarkerCluster().add_to(m)
ㅋ
for _, row in df.iterrows():
    lat = row['lat']
    lon = row['lon']
    name = row['name']
    popup_html2 = f"{name}<br>위치: {lat}, {lon}"
    folium.Marker(
        location=[lat, lon],
        popup=popup_html2,
        tooltip=name,
        icon=folium.CustomIcon('elementery.png', icon_size=(32,32))
    ).add_to(sch_cluster)

m.save('daejeon_hospital_map.html')