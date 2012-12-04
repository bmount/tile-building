# coding: utf-8

import json, psycopg2, shapely, couchdb

c = couchdb.Server()
c = c['anassimple']



fout = open('footprints_ctr_geo_very_simp.json', 'w')
conn = psycopg2.connect(database='buildingfootprints')
cur = conn.cursor()


ctr = [-122.410312, 37.761012]

w = 3

x0 = ctr[0]-w
y0 = ctr[1]-w
x1 = ctr[0]+w
y1 = ctr[1]+w

#cur.execute("""select *, st_asgeojson(st_transform(sfootprint, 4326)) from
cur.execute("""select maxheight, st_asgeojson(st_transform(st_simplify(sfootprint, 6), 4326)),
    st_asgeojson(st_transform(st_centroid(st_makevalid(sfootprint)), 4326)) from
        sbldgs where st_centroid(st_makevalid(sfootprint)) &&
        st_transform(st_envelope(st_geomfromtext('LINESTRING(%s %s,
                        %s %s)', 4326)), 900913)""", (x0,y0,x1,y1))
rv = cur.fetchall()
f = {"type":"FeatureCollection", "features":[]}
for i in rv:
    print i
    geom = ({ "geometry": json.loads(i[-1]),
        "bldg":json.loads(i[1]),
        "properties":{"height":float(i[0])}})
    print geom
    c.save(geom)
    f['features'].append(geom)


fout.write(json.dumps(f))


