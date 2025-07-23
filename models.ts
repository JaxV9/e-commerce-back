export interface Signup {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "USER";
}

export interface Login {
  email: string;
  password: string;
}
