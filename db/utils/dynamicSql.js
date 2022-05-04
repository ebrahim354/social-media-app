const objectToParams = (obj, counter = 1) => {
	let res = ''
	const columns = Object.keys(obj)
	const vals = []
	for (c of columns) {
		res += `"${c}"=$${counter++},`
		vals.push(obj[c])
	}
	res = res.slice(0, -1)
	return [res, vals, counter]
}

module.exports = { objectToParams }
