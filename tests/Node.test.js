const Node = require("../src/Node");

const createNum = (n) => new Node("number", null, { value: n });
const createId = (name, extra={}) => new Node("id", null, { name, ...extra });

describe("test Node.prototype.check", ()=>{

  it("should return true when props is partial from the instance", ()=>{
    let node;
    node = new Node("operator", [1, 2], {name:"+",operatorType:"infix"});
    expect(node.check({})).toBe(true);
    expect(node.check({name: "+"})).toBe(true);
    expect(node.check({name: "+", operatorType: "infix"})).toBe(true);
  });

  it("should return false when props is not partial from the instance", ()=>{
    let node;
    node = new Node("operator", [1, 2], {name:"+",operatorType:"infix"});
    expect(node.check({asd: ""})).toBe(false);
    expect(node.check({type: "operatorname"})).toBe(false);
    expect(node.check({name: "a"})).toBe(false);
    expect(node.check({name: "+", operatorType: "asd"})).toBe(false);
  });

  it("should return true when args are equal and checkArgs = true", ()=>{
    let node;
    node = new Node("operator", [1, 2], {name:"+",operatorType:"infix"});
    expect(
      node.check({
        name: "+",
        args: [createNum(1), createNum(2)]
      }, true)
    ).toBe(false);
  });

  it("should return true when args are NOT equal and checkArgs = false", ()=>{
    let node;
    node = new Node("operator", [1, 2], {name:"+",operatorType:"infix"});
    expect(
      node.check({
        name: "+",
        args: [1, createNum(2)]
      })
    ).toBe(true);
    expect(
      node.check({
        name: "+",
        operatorType: "infix",
        args: [createNum(3), createNum(2)]
      }, false)
    ).toBe(true);
  });

  it("should return false when args are NOT equal and checkArgs = true", ()=>{
    let node;
    node = new Node("operator", [1, 2], {name:"+",operatorType:"infix"});
    expect(
      node.check({
        name: "+",
        args: [1, createNum(2)]
      }, true)
    ).toBe(false);
  });

  it("should return true when one of the properties is Node", ()=>{
    let node;
    node = new Node(
      "operatorname", [createNum(1), createId("theta", {isBuiltin:true})], {
        name: createId("a"),
        operatorType:"infix"
      }
    );
    expect(
      node.check({
        name: { type: "id", name: "a" },
        args: [createNum(1), createId("theta", {isBuiltin:true})]
      }, true)
    ).toBe(true);
    expect(
      node.check({
        name: createId("a"),
        args: [createNum(1), createId("theta", {isBuiltin:true})]
      }, true)
    ).toBe(true);
  });

});

describe("test Node.prototype.checType", ()=>{

  it("should return true when types match", ()=>{
    let node;

    node = new Node(
      "operatorname", [createNum(1), createId("theta", {isBuiltin:true})], {
        name: createId("a"),
        operatorType:"infix"
      }
    );
    expect(node.checkType("operatorname")).toBe(true);

    node = createNum(1);
    expect(node.checkType("number")).toBe(true);

    node = createId("a");
    expect(node.checkType("id")).toBe(true);

    node = new Node("operator", [createNum(1), createNum(2)], { name: "+", operatorType: "infix" });
    expect(node.checkType("operator")).toBe(true);
  });

  it("should return false when types DON'T match", ()=>{
    let node;
    node = createNum(1);
    expect(node.checkType("id")).toBe(false);

    node = createId("a");
    expect(node.checkType("number")).toBe(false);
  });


  it("should THROW when type is not valid", ()=>{
    let node;
    node = createNum(1);
    expect(()=> node.checkType("numberasd")).toThrow();

    node = createId("a");
    expect(()=> node.checkType("idasd")).toThrow();

    node = new Node("operator", [createNum(1), createNum(2)], { name: "+", operatorType: "infix" });
    expect(()=> node.checkType("operatorasd")).toThrow();
  });


});
