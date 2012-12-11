/* probably useful for more than just exported method */

function tileUtil () {
  var self = this
  self.r = 6378137
  self.tileSize = 256
  self.halfEarth = Math.PI * self.r 
  self.earthCircumference = 2 * Math.PI * self.r
  self.resolutionInit = 2 * Math.PI * self.r / self.tileSize

  function radians(degrees) {
    return degrees/180. * Math.PI
  }

  function degrees(radians) {
    return radians/Math.PI * 180
  }

  function project(lon, lat) {
    var x = lon / 180. * self.halfEarth
      , y = Math.log(Math.tan(Math.PI/4 + radians(lat)/2)) * self.halfEarth 
    return [x, y]
  }

  function unproject(x, y) {
    var lon = x / self.halfEarth * 180
      , lat = 180/Math.PI * (2 * Math.atan(Math.exp(radians(y/self.halfEarth*180))) - Math.PI/2)
    return [lon, lat]
  }

  function pixelsToMercator(pixelX, pixelY, zoom) {
    var unitsPerPxZoom1 = self.earthCircumference / self.tileSize
      , x = pixelX * unitsPerPxZoom1 / Math.pow(2, zoom) - self.halfEarth
      , y = pixelY * unitsPerPxZoom1 / Math.pow(2, zoom) - self.halfEarth
    return [x, y]
  }

  function mercatorToPixels(x, y, zoom) {
    var unitsPerPxZoom1 = self.earthCircumference / self.tileSize
      , px = (x + self.halfEarth) * Math.pow(2, zoom) / unitsPerPxZoom1
      , py = (y + self.halfEarth) * Math.pow(2, zoom) / unitsPerPxZoom1
    return [px, py]
  }

  function pixelToTile(pixelX, pixelY) {
    var tileX = floor( pixelX / float(self.tileSize))
      , tileY = floor( pixelY / float(self.tileSize))
    return [tileX, tileY]
  }

  function mercatorToTile(x, y, zoom) {
    var pixels = mercatorToPixels(x, y, zoom)
      , pixelX = pixels[0]
      , pixelY = pixels[1]
    return pixelsToTile(pixelX, pixelY)
  }

  function tileToMercatorBounds(tileX, tileY, zoom) {
    var tileY = Math.pow(2, zoom) - 1 - tileY
      , lowerLeft = pixelsToMercator(tileX * self.tileSize, tileY * self.tileSize, zoom)
      , upperRight = pixelsToMercator((tileX + 1) * self.tileSize, (tileY+1) * self.tileSize, zoom)
    return lowerLeft.concat(upperRight)
  }

  function tileToUnprojectedBounds(tileX, tileY, zoom) {
    var b = tileToMercatorBounds(tileX, tileY, zoom)
    return [unproject(b[0],b[1]), unproject(b[2],b[3])];
  }

  return { mercatorBounds: tileToMercatorBounds, 
    unprojectedBounds: tileToUnprojectedBounds,
    unproject: unproject,
    mercator: project };
}

//exports.TileMercatorBounds = TileMercatorBounds
