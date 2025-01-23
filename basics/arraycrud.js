let myKart = ["Lexus","Nike","Puma","Rebok"]

// console.log(myKart)

// myKart.forEach(iterate)
// function iterate(value,index){
//     console.log(value+" exists @ "+index)
// }

// read
myKart.forEach((value,index)=>{
    console.log(value+" exists @ "+index)
})

myKart.push("Lenevo ThinkPad")

console.log(myKart)

let shortlisted = myKart.filter((value,index)=>{
    return value.startsWith("L")
})

console.log(shortlisted)

myKart.pop()// always removes recent one

console.log(myKart)