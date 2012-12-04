function(doc) {
  if (doc.geometry && doc.bldg) {
    emit(doc.geometry, {geometry:doc.bldg, properties:doc.properties})
	}
}
