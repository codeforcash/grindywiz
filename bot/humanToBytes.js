function printpower (n, base, power) {
  if (base === 2) {
    console.log(n * (1 << power))
  } else {
    console.log(n * Math.pow(base, power))
  }
}

const humanReadable = '86 MB'

const [n, abbreviation] = humanReadable.split(/\s+/)
if (abbreviation) {
  if (/K(iB)?$/.test(abbreviation)) {
    printpower(n, 2, 10)
  } else if (/M(iB)?$/.test(abbreviation)) {
    printpower(n, 2, 20)
  } else if (/G(iB)?$/.test(abbreviation)) {
    printpower(n, 2, 30)
  } else if (/T(iB)?$/.test(abbreviation)) {
    printpower(n, 2, 40)
  } else if (/KB$/.test(abbreviation)) {
    printpower(n, 10, 3)
  } else if (/MB$/.test(abbreviation)) {
    printpower(n, 10, 6)
  } else if (/GB$/.test(abbreviation)) {
    printpower(n, 10, 9)
  } else if (/TB$/.test(abbreviation)) {
    printpower(n, 10, 12)
  }
} else {
  console.log(n)
}
