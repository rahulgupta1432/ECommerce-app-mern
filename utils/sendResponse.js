const sendResponse = ({ res, status="success", code=200, data, message }) => {
    const responseData = Array.isArray(data) ? data : [data]; // Check if data is an array
  
    return res.status(code).json({
          status: status,
          code: code,
          message,
          data: responseData,
    });
  };
  
  export default sendResponse;