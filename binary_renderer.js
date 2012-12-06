;
var viewDv;

function unshorten (tile, scene) {
  var tile = tile
    , scene = scene || function () {}
  if (!scene.add) scene.add = function () { console.log('err', arguments); };

  function uncollect (buf, coords) {
    var fullLength = buf.byteLength,
        drawn = 0,
        ukbtype, nsubgeoms, view, x, y, px, py,
      dv = new DataView ( buf, 0, fullLength );
      viewDv = new DataView ( buf, 0, fullLength );
    while (drawn < fullLength) {
        ukbtype = dv.getUint32(drawn, true);
        nsubgeoms = dv.getUint32(drawn + 4, true);
      if (ukbtype === 2) {
        if (nsubgeoms > 0) {
          drawn = line( dv, (drawn+4), coords );
        } else {
          drawn += 12;
        }
      }
      else if (ukbtype === 3) {
        //drawn = line ( dv, drawn+4, ctx );
        drawn = polygon ( dv, drawn+4, coords );
      }
      else {
        ukbtype = 0;
        drawn += 12;
      }
    }
    return true;
  }

  function printUp (floorGeom, h) {
    var h = h || 10
      , footprintshape2d = new THREE.Shape(floorGeom)
      , footprintExtrudable = new THREE.ExtrudeGeometry(footprintshape2d, {
                amount: h, height: 0,
                bevelEnabled: false,
                material: 0, extrudeMaterial: 1
              })
      , frontMaterial = new THREE.MeshLambertMaterial( { color: 0x3f3f3f, wireframe: false } )
      , sideMaterial = new THREE.MeshLambertMaterial( { color: 0xb86b00, wireframe: false } )
      , materialArray = [ frontMaterial, sideMaterial ];
    footprintExtrudable.materials = materialArray;
    var bldg = new THREE.Mesh( footprintExtrudable, new THREE.MeshFaceMaterial() );
    scene.add(bldg);
  }

  function polygon (dv, idx, coords) {
    
    var drawn = 0,
        idx = idx,
        npts = dv.getUint32(idx, true),
        height = dv.getUint32(idx + 4, true);
    idx += 8;
    if (npts === 0) {
      return idx;
    }

    var floorGeom = []
      , x
      , y
      , offsetX = (tile().translate[0] + coords[0])*256
      , offsetY = (tile().translate[1] + coords[1])*(-256); 

    floorGeom.push(
        v2d(dv.getInt16(idx, true)/100 + offsetX, 
            //256 - dv.getInt16( idx + 2, true)/100 + offsetY )
            dv.getInt16( idx + 2, true)/100 + offsetY )
        );
    idx += 4;
    if (npts === 2) {
      floorGeom.push(
          v2d(dv.getInt16(idx, true)/100 + offsetX, 
              //256 - dv.getInt16( idx + 2, true)/100 + offsetY )
              dv.getInt16( idx + 2, true)/100 + offsetY )
          );
      try {
        printUp(floorGeom, height)
      } catch (e) {
      }
      return idx + 4;
    }
    for (var i = 4; i < 4*(npts-1); i += 4) {
      floorGeom.push(
          v2d(dv.getInt16(idx + i, true)/100 + offsetX, 
            //256 - dv.getInt16( idx + i + 2, true)/100 + offsetY )
            dv.getInt16( idx + i + 2, true)/100 + offsetY )
          );
    }
    try {
    printUp(floorGeom, height);
    } catch (e) {
    }
    return idx + 4*(npts - 1);
  }

  function line (dv, idx, tile) {
    var drawn = 0,
        idx = idx,
        npts = dv.getUint32(idx, true),
        osmstyle = dv.getUint32(idx + 4, true);
    var dummy;
    streetrender(osmstyle, 0);
    idx += 8;
    dummy = (dv.getInt16(idx, true)/100, 256 - dv.getInt16( idx + 2, true)/100);
    idx += 4;
    if (npts === 2) {
      dummy = (dv.getInt16(idx, true)/100, 256 - dv.getInt16( idx + 2, true)/100);
      return idx + 4;
    }
    for (var i = 4; i < 4*(npts-1); i += 4) {
      dummy = (dv.getInt16(idx + i, true)/100, 256 - dv.getInt16( idx + i + 2, true)/100);
    }
    return idx + 4*(npts - 1);
  }

  return uncollect;
}

