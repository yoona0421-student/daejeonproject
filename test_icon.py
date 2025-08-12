import folium

m = folium.Map(location=[36.35, 127.38], zoom_start=12)
folium.Marker(
    location=[36.35, 127.38],
    icon=folium.CustomIcon('elementery.png', icon_size=(32,32))
).add_to(m)
m.save('test_icon.html')