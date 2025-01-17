"use client";

import { api } from "@/lib/api";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function NewCLientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [faceImage, setFaceImage] = useState<string | null>(null);

  const handleCreateClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name || !faceImage) {
      return toast.error("Preencha todos os dados", {
        style: {
          background: "rgb(249 115 22)",
          color: "#ffff",
        },
        iconTheme: {
          primary: "#ffff",
          secondary: "rgb(249 115 22)",
        },
      });
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const fileToUpload = formData.get("faceImage");
    let faceImageUrl = "";
    let faceImageName = "";

    if (fileToUpload instanceof File && fileToUpload.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.set("file", fileToUpload);

      try {
        const uploadImageResponse = await api.post("/upload", uploadFormData);
        faceImageUrl = uploadImageResponse.data.url;
        faceImageName = uploadImageResponse.data.filename;
      } catch (error) {
        console.log(error);
      }
    }

    try {
      await api.post("/client/new", {
        name,
        email,
        faceImageUrl,
        faceImageName,
        hasPermission: true, // Default permission
      });

      resetForm();

      toast.success("Cliente criado com sucesso", {
        style: {
          background: "rgb(249 115 22)",
          color: "#ffff",
        },
        iconTheme: {
          primary: "#ffff",
          secondary: "rgb(249 115 22)",
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar cliente", {
        style: {
          background: "rgb(249 115 22)",
          color: "#ffff",
        },
        iconTheme: {
          primary: "#ffff",
          secondary: "rgb(249 115 22)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setFaceImage(null);

    if (formRef.current) {
      formRef.current.reset();
    }
  };

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;

    if (!files) {
      return;
    }

    const previewURL = URL.createObjectURL(files[0]);

    setFaceImage(previewURL);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleCreateClient}
      className="w-full flex flex-col gap-4"
    >
      <input
        onChange={onFileSelected}
        type="file"
        name="faceImage"
        id="media"
        accept="image/*"
        className="invisible h-0 w-0"
      />

      {faceImage ? (
        <div className="relative">
          <img
            src={faceImage}
            alt=""
            className="w-full h-72 rounded-lg object-cover shadow-sm"
          />
          <Button
            size="icon"
            className="absolute top-2 right-2 opacity-60 hover:opacity-100"
            onClick={() => {
              if (formRef.current) {
                formRef.current.reset();
                setFaceImage(null);
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="media"
          className="w-full h-72 flex flex-col justify-center items-center gap-2 border-2 border-dashed border-orange-500/60 text-orange-500 rounded-lg cursor-pointer hover:bg-orange-400/10"
        >
          <ImagePlus className="size-6" />
        </label>
      )}

      <div className="w-full flex gap-3">
        <Input
          id="username"
          placeholder="Nome"
          className="w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button className="w-full">
        {isLoading ? (
          <>
            Salvando <Loader2 className="ml-2 size-5 animate-spin" />
          </>
        ) : (
          "Salvar"
        )}
      </Button>
    </form>
  );
}
