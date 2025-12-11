const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    {...props}
  />
);

export default Input;
