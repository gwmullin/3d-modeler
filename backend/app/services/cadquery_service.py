import cadquery as cq
import tempfile
import os
import io

# Safe execution dictionary
SAFE_LOCALS = {}
SAFE_GLOBALS = {
    "cq": cq,
    "cadquery": cq,
    "print": print,
    "range": range,
    "len": len,
    "float": float,
    "int": int,
    "str": str,
    "list": list,
    "tuple": tuple,
    "dict": dict,
    "abs": abs,
    "min": min,
    "max": max,
    "pow": pow,
    "round": round,
    "sorted": sorted,
    "sum": sum,
    "enumerate": enumerate,
    "zip": zip,
}
# Allow math module
import math
SAFE_GLOBALS["math"] = math

def execute_cadquery(code_str: str):
    """
    Executes the CadQuery code and returns the GLB bytes and the result object.
    """
    local_scope = {}
    
    try:
        exec(code_str, SAFE_GLOBALS, local_scope)
    except Exception as e:
        raise ValueError(f"Execution Error: {str(e)}")
    
    if "result" not in local_scope:
        raise ValueError("The code did not produce a 'result' variable.")
    
    result = local_scope["result"]
    
    # Export to GLTF (GLB)
    with tempfile.NamedTemporaryFile(suffix=".glb", delete=False) as tmp:
        tmp_path = tmp.name
    
    try:
        # Check if Assembly or Workplane
        if isinstance(result, cq.Assembly):
            result.export(tmp_path, "GLTF")
        elif isinstance(result, cq.Workplane):
             # For Workplane, often needs to be converted to assembly for GLTF export 
             # or use assembly wrapping
             assembly = cq.Assembly(result)
             assembly.save(tmp_path, "GLTF")
        elif isinstance(result, cq.Shape):
             assembly = cq.Assembly(result)
             assembly.save(tmp_path, "GLTF")
        else:
             # Try generic export or fail
             assembly = cq.Assembly(result)
             assembly.save(tmp_path, "GLTF")

        with open(tmp_path, "rb") as f:
            glb_data = f.read()
            
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
    return glb_data, result

def export_stl(result_obj) -> str:
    """Exports result to STL file and returns path."""
    with tempfile.NamedTemporaryFile(suffix=".stl", delete=False) as tmp:
        path = tmp.name
    
    # STL export usually works on Workplane or Shapes. 
    # Logic to extract shape if it's an assembly or just export whatever possible
    try:
        if isinstance(result_obj, cq.Assembly):
             # Assembly export to STL is tricky, usually needs component iteration or distinct file
             # CadQuery 2.x Assembly export to STL might assume single merged solid for stl
             result_obj.save(path, "STL")
        else:
             cq.exporters.export(result_obj, path, "STL")
    except Exception as e:
        # Fallback or specific error
        raise ValueError(f"STL Export Error: {e}")
        
    return path
